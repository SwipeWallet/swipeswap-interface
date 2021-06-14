import { Fraction } from '../entities'
import { ethers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import useActiveWeb3React from '../hooks/useActiveWeb3React'
import { useSaaveContract, useSwipeContract } from '../hooks/useContract'
import { useTransactionAdder } from '../state/transactions/hooks'
import { BalanceProps } from './useTokenBalance'

const { BigNumber } = ethers

const useMaker = () => {
    const { account } = useActiveWeb3React()

    const addTransaction = useTransactionAdder()
    const swipeContract = useSwipeContract(true) // withSigner
    const saaveContract = useSaaveContract(true) // withSigner

    // Allowance
    const [allowance, setAllowance] = useState('0')
    const fetchAllowance = useCallback(async () => {
        if (account) {
            try {
                const allowance = await swipeContract?.allowance(account, saaveContract?.address)
                console.log('allowance', allowance)
                const formatted = Fraction.from(BigNumber.from(allowance), BigNumber.from(10).pow(18)).toString()
                setAllowance(formatted)
            } catch (error) {
                setAllowance('0')
                throw error
            }
        }
    }, [account, saaveContract?.address, swipeContract])
    useEffect(() => {
        if (account && saaveContract && swipeContract) {
            fetchAllowance()
        }
        const refreshInterval = setInterval(fetchAllowance, 10000)
        return () => clearInterval(refreshInterval)
    }, [account, fetchAllowance, saaveContract, swipeContract])

    // Approve
    const approve = useCallback(async () => {
        try {
            const tx = await swipeContract?.approve(saaveContract?.address, ethers.constants.MaxUint256.toString())
            return addTransaction(tx, { summary: 'Approve' })
        } catch (e) {
            return e
        }
    }, [addTransaction, saaveContract?.address, swipeContract])

    // Saave Sushi - xSUSHI - aXSUSHI
    const saave = useCallback(
        async (amount: BalanceProps | undefined) => {
            if (amount?.value) {
                try {
                    const tx = await saaveContract?.saave(amount?.value)
                    return addTransaction(tx, { summary: 'SUSHI → xSUSHI → aXSUSHI' })
                } catch (e) {
                    return e
                }
            }
        },
        [addTransaction, saaveContract]
    )

    return { allowance, approve, saave }
}

export default useMaker
