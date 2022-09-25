const query_AllAfterBlockNum = (blockNum="") => {
    let filter;
    if (blockNum!=="") filter=`( filter: { blockNum: {greaterThan: ${blockNum} }})`;
    else filter="";

    if (blockNum!=="") filterForLists=`(last:1 filter: { blockNum: {greaterThan: ${blockNum} }})`;
    else filter="";

    const query =
            `
            query {
                voteds  ${filter} {
                      nodes {
                                id,
                                blockNum,
                                timestamp,
                                voterAccountId,
                                refIndex,
                                voteBalance,
                                voteConvictionNum,
                                voteLock,
                                voteDirection,
                                voteAye,
                                voteNay,
                                voteTypeStandard,
                                extrinsicHash,
                            }
                },
                preImageNoteds ${filter} {
                        nodes {
                                id,
                                blockNum,
                                timestamp,
                                preImageHash,
                                preImageAccountId,
                                preImageStorageFees,
                                extrinsicHash
                               }
                },
                proposeds ${filter} {
                        nodes {
                                id,
                                blockNum,
                                timestamp,
                                proposalIndex,
                                proposalDeposit,
                                proposalAccountId,
                                extrinsicHash,
                            }
                },
                secondeds ${filter} {
                        nodes {
                                id,
                                blockNum,
                                timestamp,
                                proposalIndex,
                                seconderAccountId,
                                secondedAmount,
                                extrinsicHash,
                            }
                },
                tableds ${filter} {
                    nodes {
                            id,
                            blockNum,
                            timestamp,
                            proposalIndex,
                            depositAmount,
                            depositors,
                            referendumIndex,
                        }
                },
                passeds ${filter} {
                    nodes {
                            id,
                            blockNum,
                            timestamp,
                            referendumIndex,
                            scheduledEnactmentBlock,
                        }
                },
                notPasseds ${filter} {
                    nodes {
                            id,
                            blockNum,
                            timestamp,
                            referendumIndex,
                        }
                },
                executeds ${filter} {
                    nodes {
                            id,
                            blockNum,
                            timestamp,
                            referendumIndex,
                            result,
                            proposalHash,
                            providerAccount,
                            refundedAmountString,
                            refundedAmount
                        }
                },
                proposalCanceleds ${filter} {
                    nodes {
                            id,
                            blockNum,
                            timestamp,
                            referendumIndex,
                        }
                },
                referendumCanceleds ${filter} {
                    nodes {
                            id,
                            blockNum,
                            timestamp,
                            referendumIndex,
                        }
                },
                removeVoteCalls ${filter} {
                    nodes {
                            id,
                            blockNum,
                            timestamp,
                            signerAccountId,
                            argsIndex,
                        }
                },
                unlockCalls ${filter} {
                    nodes {
                            id,
                            blockNum,
                            timestamp,
                            signerAccountId,
                            argsTargetAccountId,
                        }
                },
                activeProposalsReferendaLists ${filterForLists} {
                    nodes {
                            id,
                            blockNum,
                            now,
                            timestamp,
                            lowestUnbaked,
                            referendumCount,
                            publicPropsLength,
                            proposalList,
                            referendaArray,
                        }
                },


              }
            `;
    return query
};



module.exports = {
    query_AllAfterBlockNum,
    
}
