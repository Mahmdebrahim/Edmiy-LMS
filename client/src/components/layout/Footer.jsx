import { assets } from "../../assets/assets";

export default function Footer() {
  return (
    <>
      {/*  */}
      <footer className="bg-gray-800 mt-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between gap-y-12 lg:gap-x-8">
            <div className="w-full md:w-[45%] lg:w-[35%] flex flex-col items-center md:items-start text-center md:text-left">
              <a href="https://edunova.com">
                <img
                  className="h-8 w-auto"
                  src={assets.logoo}
                  alt="EduNova Logo"
                />
              </a>
              <div className="w-full max-w-52 h-px mt-8 bg-linear-to-r from-black via-white/25 to-black"></div>
              <p className="text-sm text-white/60 mt-6 max-w-sm leading-relaxed">
                EduNova is an online learning platform that offers a wide range of courses and resources to help you acquire new skills and knowledge.
              </p>
            </div>

            <div className="w-full md:w-[45%] lg:w-[15%] flex flex-col items-center md:items-start text-center md:text-left">
              <h3 className="text-sm text-white font-medium">
                Important Links
              </h3>
              <div className="flex flex-col gap-2 mt-6">
                <a
                  href="#"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Home
                </a>
                <a
                  href="#"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  About
                </a>
                <a
                  href="#"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Portfolio
                </a>
                <a
                  href="#"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Contact
                </a>
                <a
                  href="#"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  FAQ
                </a>
              </div>
            </div>

            <div className="w-full md:w-[45%] lg:w-[15%] flex flex-col items-center md:items-start text-center md:text-left">
              <h3 className="text-sm text-white font-medium">Social Links</h3>
              <div className="flex flex-col gap-2 mt-6">
                <a
                  href="#"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Twitter
                </a>
                <a
                  href="#"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Instagram
                </a>
                <a
                  href="#"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Youtube
                </a>
                <a
                  href="#"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Linkedin
                </a>
              </div>
            </div>

            <div className="w-full md:w-[45%] lg:w-[25%] flex flex-col items-center md:items-start text-center md:text-left">
              <h3 className="text-sm text-white font-medium">
                Subscribe for news
              </h3>
              <div className="flex items-center border gap-2 border-white/20 h-13 max-w-80 w-full rounded-full overflow-hidden mt-4">
                <input
                  type="email"
                  placeholder="Enter your email.."
                  className="w-full h-full pl-6 outline-none text-sm bg-transparent text-white placeholder-white/60 placeholder:text-xs"
                  required
                />
                <button
                  type="submit"
                  className="bg-linear-to-b from-[#420bcf] to-[#2d77e6] active:scale-95 transition w-56 h-10 rounded-full text-sm text-white cursor-pointer mr-1.5"
                >
                  Subscribe
                </button>
                
              </div>
            </div>
          </div>

          <div className="w-full h-px mt-16 mb-4 bg-linear-to-r from-black via-white/25 to-black"></div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/60">© 2025 EduNova</p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                Terms & Conditions
              </a>
              <div className="w-px h-4 bg-white/20"></div>
              <a
                href="#"
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
        
      </footer>
    </>
  );
}
