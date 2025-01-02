export default function Hero() {
    return (
        <div className="hero bg-base-100 min-h-[90vh]">
  <div className="hero-content text-center">
    <div className="max-w-md">
      <h1 className="rainbow-text text-7xl font-bold">Pixl.io</h1>
      <p className="rainbow-text py-6">
        A free, open source, pixel art editor built with Next.Js and Go
      </p>
      <a href="sign-in"><button className="btn btn-info">Sign In</button> </a>
      <a href="canvas"><button className="btn btn-info">New Canvas</button></a>
    </div>
  </div>
</div>
    )
}