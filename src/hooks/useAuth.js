import { useSelector } from "react-redux";

const useAuth=()=>{
    const user=useSelector((state=>state.user))
    return {isAuthenticated:!!user,user}
}

export default useAuth;