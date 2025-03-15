import { useContext, useEffect } from "react"
import AppContext from "../../state/AppContext"
import UserStore from "../../state/stores/UserStore"

const UserFetchDetailsForm = () => {
    const globalState = useContext(AppContext)

    return (
        <div>
            <p>
                user email: {globalState.user.data && globalState.user.data.email ? globalState.user.data.email : "INVALID USER"}
            </p>
            <p>
                user token: {globalState.user.data && globalState.user.data.token ? globalState.user.data.token : "INVALID TOKEN"}
            </p>
            <p>
                user id: {globalState.user.data && globalState.user.data.id ? globalState.user.data.id : "INVALID TOKEN"}
            </p>
        </div>
    )
}

export default UserFetchDetailsForm