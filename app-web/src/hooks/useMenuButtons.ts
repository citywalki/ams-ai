import {useEffect, useState} from 'react'
import axios from 'axios'

export const useMenuButtons = (menuCode: string) => {
    const [buttons, setButtons] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!menuCode) {
            setButtons([])
            return
        }

        setLoading(true)
        setError(null)

        axios.get<string[]>(`/api/system/permissions/user/menu/${menuCode}`)
            .then(response => {
                setButtons(response.data)
            })
            .catch(err => {
                console.error('Failed to fetch menu buttons:', err)
                setError(err)
                setButtons([])
            })
            .finally(() => {
                setLoading(false)
            })
    }, [menuCode])

    const hasButton = (action: string): boolean => {
        if (!buttons || buttons.length === 0) return false
        return buttons.includes(`${menuCode}:${action}`)
    }

    return {
        buttons,
        loading,
        error,
        hasButton,
    }
}
