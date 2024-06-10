import { useRouter } from "next/router";

const Home=()=>{
    const router = useRouter()
    const handleFileSend=()=>{
        router.push('/')
    }

    return(
        <div>
            <button type="button" onClick={handleFileSend}>Send File</button>
            <button type="button">Receive File</button>
        </div>
    )
}

export default Home;