import React from 'react';
export default function Card({
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
    handleGoogleLogin
}) {
    return (
        <div className="bg-base-100 w-96">
             <div className="card-body">
                 <h2 className="card-title text-2xl font-bold mb-6">Login</h2>
                 <form onSubmit={handleLogin}>
                     <div className="form-control">
                         <label className="label">
                             <span className="label-text">Email</span>
                         </label>
                         <label className="input input-bordered flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" /><path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" /></svg>
                             <input 
                             type="email"
                              className="grow" 
                              placeholder="email@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              />
                         </label>
                     </div>
                     <div className="form-control mt-4">
                         <label className="label">
                             <span className="label-text">Password</span>
                         </label>
                         <label className="input input-bordered flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" /></svg>
                             <input
                              type="password" 
                              className="grow" 
                              placeholder="Enter password" 
                              value={password}
                              onChange={(e) => setPassword(e.target.value)} 
                              />
                         </label>
                         <label className="label">
                             <a href="#" className="label-text-alt link link-hover">Forgot password?</a>
                         </label>
                     </div>
                     <div className="form-control mt-6">
                         <button type="submit" className="btn btn-primary">
                             Login
                         </button>
                     </div>
                 </form>
                 <div className="divider">OR</div>
                 <div className="text-center">

<button onClick={handleGoogleLogin}  className="link link-primary  btn btn-outline btn-primary w-[20rem]">
<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="40" height="40" viewBox="0 0 38 48">
<path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
</svg>
   
   Sign in with Google</button>
</div>
                 <div className="text-center">
                     <p>Don't have an account?</p>
                     <a href="sign-up" className="link link-primary">Sign up now</a>
                 </div>
             </div>
         </div>
        )
}