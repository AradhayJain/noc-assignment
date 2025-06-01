import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submit,setSubmit]=useState(false);
    const navigate = useNavigate();
    const isDisabled=false;

    useEffect(()=>{
        if(localStorage.getItem('token')){
            navigate('/dashboard');
        }
    },[])

    const handleSubmit = async () => {
        if (!email || !password) {
            toast.error("Please fill in all fields.");
            return;
        }

        try {
            const { data } = await axios.post("/api/users/login", {
                email,
                password,
            });

            if (data) {

                setSubmit(true)
                console.log(data.token)

                localStorage.setItem("token",data.token);
                toast.success("Login successful");

              
                setTimeout(() => {
                    navigate("/dashboard");
                }, 4000);
            }
        } catch (err) {
            console.error(err);
            toast.error("Invalid credentials or server error.");
        }
    };

    return (
        <div className="h-screen w-full bg-gray-50">
            <ToastContainer />
            <div className="h-full w-full flex justify-center items-center">
                <div className="flex flex-col p-6 w-[65vh] bg-white border-2 text-gray-800 border-gray-200 rounded-2xl shadow-xl shadow-gray-300">
                    <div className="flex items-center justify-center h-20 w-full">
                        <h1 className="text-3xl font-bold text-stone-700">Login</h1>
                    </div>

                    <div className="mt-4 ml-5 flex flex-col gap-2">
                        <label>Email:</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            className="w-[80%] h-[6vh] rounded-full border-2 p-2 border-gray-300"
                            type="email"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="mt-4 ml-5 flex flex-col gap-2">
                        <label>Password:</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            className="w-[80%] h-[6vh] rounded-full border-2 p-2 border-gray-300"
                            type="password"
                            placeholder="Enter your password"
                        />
                    </div>

                    <div className="mt-8 flex justify-center items-center w-full">
                    {
                            !submit ? (
                                <button
                            disabled={isDisabled}
                            onClick={handleSubmit}
                            className={`px-10 py-4 rounded-2xl border-2 font-semibold transition-all duration-200 ${
                                isDisabled
                                    ? "bg-blue-100 border-blue-200 text-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 border-blue-700 text-white hover:scale-105"
                            }`}
                        >
                            Login
                        </button>
                            ) : (
                                <div className="animate-spin w-6 h-6 border-4 rounded-full border-t-transparent border-blue-500"></div>
                            )
                        }

                    </div>
                    <h1 className="flex gap-3 items-center mt-3">New here ? <p onClick={()=>navigate("/")} className="text-red-400 cursor-pointer">Sign In</p></h1>
                </div>
            </div>
        </div>
    );
};

export default Login;
