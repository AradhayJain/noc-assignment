import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer,toast } from "react-toastify";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isDisabled, setIsDisabled] = useState(true);
    const [submit,setSubmit]=useState(false);
    const navigate=useNavigate();

    useEffect(()=>{
            if(localStorage.getItem('token')){
                navigate('/dashboard');
            }
    },[])

    
    const isPasswordValid = (pwd) => {
        const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
        return regex.test(pwd);
    };

    useEffect(() => {
        const passwordsMatch = password === confirmPassword;
        const passwordValid = isPasswordValid(password);

        if (passwordsMatch && passwordValid) {
            setIsDisabled(false);
        } else {
            setIsDisabled(true);
        }
    }, [password, confirmPassword]);

    const handleSubmit = async () => {
        console.log("Submitting...");
        const formData = {
            username:name,
            email:email,
            password:password,
        };
        const { data } = await axios.post("/api/users/register", formData);
        if(data){

            setSubmit(true);
            
            toast.success("Registration Successfull");
            setTimeout(() => {
                navigate("/login");
            }, 4000); // 2 seconds delay
        }
        else{
            toast.error("Registration Failed");
        }
        
    };

    return (
        <div className="h-screen w-full bg-gray-50">
            <ToastContainer/>
            <div className="h-full w-full flex justify-center items-center">
                <div className="flex flex-col p-6 w-[65vh] bg-white border-2 text-gray-800 border-gray-200 rounded-2xl shadow-xl shadow-gray-300">
                    <div className="flex items-center justify-center h-20 w-full">
                        <h1 className="text-3xl font-bold text-stone-700">REGISTER</h1>
                    </div>
                    <div className="mt-4 ml-5 flex flex-col gap-2">
                        <label className="text-xl font-bold bg-gradient-to-r from-blue-300 to-yellow-500 bg-clip-text text-transparent">Name:</label>
                        <input onChange={(e) => setName(e.target.value)} className="w-[80%] h-[6vh] rounded-full border-2 p-2 border-gray-300" type="text" placeholder="Enter your name" />
                    </div>
                    <div className="mt-4 ml-5 flex flex-col gap-2">
                        <label className="text-xl font-bold bg-gradient-to-r from-blue-300 to-yellow-500 bg-clip-text text-transparent">Email:</label>
                        <input onChange={(e) => setEmail(e.target.value)} className="w-[80%] h-[6vh] rounded-full border-2 p-2 border-gray-300" type="email" placeholder="Enter your email" />
                    </div>
                    <div className="mt-4 ml-5 flex flex-col gap-2">
                        <label className="text-xl font-bold bg-gradient-to-r from-blue-300 to-yellow-500 bg-clip-text text-transparent">Password:</label>
                        <input onChange={(e) => setPassword(e.target.value)} className="w-[80%] h-[6vh] rounded-full border-2 p-2 border-gray-300" type="password" placeholder="Enter your password" />
                        {!isPasswordValid(password) && password && (
                            <p className="text-sm text-red-500">Password must contain letters, numbers & special characters</p>
                        )}
                    </div>
                    <div className="mt-4 ml-5 flex flex-col gap-2">
                        <label className="text-xl font-bold bg-gradient-to-r from-blue-300 to-yellow-500 bg-clip-text text-transparent">Confirm Password:</label>
                        <input onChange={(e) => setConfirmPassword(e.target.value)} className="w-[80%] h-[6vh] rounded-full border-2 p-2 border-gray-300" type="password" placeholder="Confirm password" />
                        {password !== confirmPassword && confirmPassword && (
                            <p className="text-sm text-red-500">Passwords do not match</p>
                        )}
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
                            Register
                        </button>
                            ) : (
                                <div className="animate-spin w-6 h-6 border-4 rounded-full border-t-transparent border-blue-500"></div>
                            )
                        }
                    </div>
                    <h1 className="flex gap-3 items-center mt-3">Already have an account ? <p onClick={()=>navigate("/login")} className="text-red-400 cursor-pointer">Log In</p></h1>
                </div>
            </div>
        </div>
    );
};

export default Register;
