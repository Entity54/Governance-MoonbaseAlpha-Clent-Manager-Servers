// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";

contract ntt54_Channels {
    address constant tokenAddress = 0x0000000000000000000000000000000000000802; //to be replaced by our own ERC20

    address public networkAdmin;
    uint256 public channelCreationFees = 100000000000000000;
    uint256 public channelDeletionFees = 100000000000000000;
    uint256 public channelChangeAdminFees = 100000000000000000;
    uint256 public treasuryBalance;
    // bool public communicationsState;
    uint256 public channelIndex = 0;

    //Details for any Will Neneficiary
    struct ChannelSpec {
        address admin;
        uint256 creationBlockNumber;
        uint256 creationTimestamp;
        uint256 id;
        string name; //e.g. Moonbase Broadcasting Channel
        string ticker; //e.g. MBC
        string metadataCid; //e.g. logo of channel stored at IPFS CID
        address[] subscribers;
        bool active;
    }

    address[] public channelOwnersList; //array with addresses of all channel owners
    mapping(address => uint256[]) public channelAdminOwnsChannelIDs; //mapping for owner what channel he is admin for
    mapping(uint256 => ChannelSpec) public channelSpecs; //mapping channelId => ChannelSpec
    mapping(address => mapping(address => uint256)) public channelAdminBalances; //Admin of a channel must hold a balance
    mapping(address => mapping(uint256 => bool)) public subscriberChannelIDs; //mapping for subscriber's address => channelID => Subscribed(true/false)
    mapping(address => string) private subscriberMobileToken; //mapping for subscriber address to device token (encrypted)
    mapping(uint256 => string[]) private pendingNotifications; //mapping pending notifications array for a channelId. notifications are CIDs e.g. QmQCECBBJchxxpS3mWFR7Paq7kV6XemeDmcG3x6vDyfq4E
    mapping(uint256 => bool) public channelHasPendingNotifications; //this is needed in order to enable scheduled notifcations structs in future and payload types

    //Events
    event SendNotifications(uint256, string[]);
    event Received(address, uint256);

    modifier onlyAdmin() {
        require(msg.sender == networkAdmin, "action only for networkAdmin");
        _;
    }

    constructor() {
        networkAdmin = msg.sender;
    }

    function getChannelOwnersList() public view returns (address[] memory) {
        return channelOwnersList;
    }

    function getChannelAdminOwnedChannels(address channelAdmin)
        public
        view
        returns (uint256[] memory)
    {
        return channelAdminOwnsChannelIDs[channelAdmin];
    }

    function getChannelSpecs(uint256 channelId)
        external
        view
        returns (ChannelSpec memory)
    {
        return channelSpecs[channelId];
    }

    function getChannelAdminBalance(address _tokenAddress, address channelAdmin)
        public
        view
        returns (uint256)
    {
        return channelAdminBalances[_tokenAddress][channelAdmin];
    }

    function getPendingNotification(uint256 channelId)
        public
        view
        returns (string[] memory)
    {
        string[] memory channelPrendingNotifications;
        if (
            msg.sender == networkAdmin ||
            msg.sender == channelSpecs[channelId].admin
        ) {
            channelPrendingNotifications = pendingNotifications[channelId];
        }
        return channelPrendingNotifications;
    }

    function getSubscriberEncryptedMobileToken(address subscriberAddress)
        public
        view
        returns (string memory)
    {
        string memory mobileToken;
        if (msg.sender == networkAdmin) {
            mobileToken = subscriberMobileToken[subscriberAddress];
        }
        return mobileToken;
    }

    function createChannel(
        string memory channelName,
        string memory channelTicker
    ) external returns (bool) {
        deposit(channelCreationFees);
        ++channelIndex;
        ChannelSpec memory newChannel = ChannelSpec({
            admin: msg.sender,
            creationBlockNumber: block.number,
            creationTimestamp: block.timestamp,
            id: channelIndex,
            name: channelName,
            ticker: channelTicker,
            metadataCid: "empty",
            subscribers: new address[](0),
            active: true
        });
        channelOwnersList.push(msg.sender);
        channelAdminOwnsChannelIDs[msg.sender].push(channelIndex);
        channelSpecs[channelIndex] = newChannel;
        return true;
    }

    function deleteChannel(uint256 channelID) external {
        require(
            channelSpecs[channelID].active &&
                channelSpecs[channelID].admin == msg.sender,
            "channel must be active and being channel admin"
        );

        //delete channel for each subscriber in the channel
        address[] memory subsribers = channelSpecs[channelID].subscribers;
        for (uint256 i = 0; i < subsribers.length; i++) {
            address subscriberAddress = subsribers[i];
            subscriberChannelIDs[subscriberAddress][channelID] = false;
        }

        //remove the channel from the array of channels msg.sender has
        uint256[] storage channelsArrray = channelAdminOwnsChannelIDs[
            msg.sender
        ];
        if (channelsArrray.length > 1) {
            for (uint256 i = 0; i < channelsArrray.length; i++) {
                if (channelsArrray[i] == channelID) {
                    channelsArrray[i] = channelsArrray[
                        channelsArrray.length - 1
                    ];
                    break;
                }
            }
        }
        channelsArrray.pop();

        //if msg.sender is not the admin of any channels anymore then delete from channelOwnersList
        if (channelsArrray.length == 0) {
            if (channelOwnersList.length > 1) {
                for (uint256 i = 0; i < channelOwnersList.length; i++) {
                    if (channelOwnersList[i] == msg.sender) {
                        channelOwnersList[i] = channelOwnersList[
                            channelOwnersList.length - 1
                        ];
                        break;
                    }
                }
            }
            channelOwnersList.pop();
        }

        delete channelSpecs[channelID];

        withdraw(channelDeletionFees);
    }

    function changeChannelAdmin(address newChannelAdmin, uint256 channelID)
        external
        returns (bool)
    {
        require(
            channelSpecs[channelID].active &&
                channelSpecs[channelID].admin == msg.sender,
            "channel must be active and being channel admin"
        );
        depositToTreasury(channelChangeAdminFees); //this is a paid functionality
        channelSpecs[channelID].admin = newChannelAdmin;
        //update ledger for channelCreationFees
        channelAdminBalances[tokenAddress][msg.sender] -= channelCreationFees;
        channelAdminBalances[tokenAddress][
            newChannelAdmin
        ] += channelCreationFees;

        //TODO update channelAdminOwnsChannelIDs channelOwnersList
        return true;
    }

    function registerSubscriberToken(string memory subscriberToken) external {
        require(
            keccak256(abi.encodePacked(subscriberMobileToken[msg.sender])) !=
                keccak256(abi.encodePacked(subscriberToken)),
            "subscriber has already registered token"
        );
        //here the subscriber can register new device for same address
        subscriberMobileToken[msg.sender] = subscriberToken;
    }

    function unRegisterSubscriberToken() external {
        subscriberMobileToken[msg.sender] = "";
    }

    function subscribeToChannel(uint256 channelID) external {
        require(
            channelSpecs[channelID].active,
            "channel must be active to subscribe"
        );
        require(
            !subscriberChannelIDs[msg.sender][channelID],
            "already subscribe to channel"
        );
        require(
            keccak256(abi.encodePacked(subscriberMobileToken[msg.sender])) !=
                keccak256(abi.encodePacked("")),
            "subscriber must register mobile token first"
        );

        subscriberChannelIDs[msg.sender][channelID] = true;

        //subscribe sender to channel subscribers
        channelSpecs[channelID].subscribers.push(msg.sender);
    }

    function unSubscribeFromChannel(uint256 channelID) external {
        require(
            channelSpecs[channelID].active,
            "channel must be active to unSubscribe"
        );
        require(
            subscriberChannelIDs[msg.sender][channelID],
            "not a subscriber to channel"
        );
        subscriberChannelIDs[msg.sender][channelID] = false;

        uint256 channelSubLength = channelSpecs[channelID].subscribers.length;
        if (channelSubLength > 1) {
            for (uint256 i = 0; i < channelSubLength; i++) {
                if (channelSpecs[channelID].subscribers[i] == msg.sender) {
                    channelSpecs[channelID].subscribers[i] = channelSpecs[
                        channelID
                    ].subscribers[channelSubLength - 1];
                    break;
                }
            }
        }
        channelSpecs[channelID].subscribers.pop();
    }

    //submit your notifications for networkAdmin to pick up and distribute
    function submitNotification(
        uint256 channelId,
        string memory notificationCID
    ) external {
        require(
            channelSpecs[channelId].active &&
                channelSpecs[channelId].admin == msg.sender,
            "channel must be active and sender channel admin"
        );
        pendingNotifications[channelId].push(notificationCID);
        if (!channelHasPendingNotifications[channelId]) {
            channelHasPendingNotifications[channelId] = true;
        }
    }

    function releaseChannelNotification(uint256 channelId) external onlyAdmin {
        string[] memory notificationsToSend = pendingNotifications[channelId];
        string[] memory channelPendingNotifications;
        pendingNotifications[channelId] = channelPendingNotifications;
        channelHasPendingNotifications[channelId] = false; //will be amended once we expand to sheduled notifications also
        emit SendNotifications(channelId, notificationsToSend);
    }

    function deposit(uint256 amount) internal {
        ERC20 token = ERC20(tokenAddress);
        require(
            amount <= token.allowance(msg.sender, address(this)),
            "channel admin needs to increase allowance"
        );
        token.transferFrom(msg.sender, address(this), amount);
        channelAdminBalances[tokenAddress][msg.sender] += amount;
    }

    function withdraw(uint256 amount) internal {
        require(
            amount <= channelAdminBalances[tokenAddress][msg.sender],
            "channel admin asks to withdraw more than current balance"
        );
        ERC20 token = ERC20(tokenAddress);
        channelAdminBalances[tokenAddress][msg.sender] -= amount;
        token.transfer(msg.sender, amount);
    }

    function changeNetworkAdmin(address newNetworkAdmin) external onlyAdmin {
        networkAdmin = newNetworkAdmin;
    }

    function depositToTreasury(uint256 amount) internal {
        ERC20 token = ERC20(tokenAddress);
        require(
            amount <= token.allowance(msg.sender, address(this)),
            "channel admin needs to increase allowance"
        );
        token.transferFrom(msg.sender, address(this), amount);
        treasuryBalance += amount;
    }

    function withdrawFromTreasury(uint256 amount) external onlyAdmin {
        require(
            amount <= treasuryBalance,
            "withdrawal amount must not exceed treasuryBalance"
        );
        ERC20 token = ERC20(tokenAddress);
        treasuryBalance -= amount;
        token.transfer(msg.sender, amount);
    }

    function getBalanceSC() public view returns (uint256) {
        return address(this).balance;
    }

    //to be amended for project treasury funds only
    function withdrawSC() external onlyAdmin {
        payable(msg.sender).transfer(address(this).balance);
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
