export default function Index() {
  return (
    <div className="min-h-screen bg-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Main Container */}
        <div className="relative w-full">
          {/* Level Badge and Title - Same Line on Desktop */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-6 mb-6">
            <div className="flex justify-start mb-3 lg:mb-0">
              <div className="flex items-center justify-center px-4 py-1 bg-[#007BE5] border-2 border-[#00559E] rounded-2xl">
                <span className="text-white font-bold text-lg lg:text-base" style={
                  {
                    fontFamily: 'Inter, sans-serif',
                  }
                }>Level-7</span>
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-[#23395B] font-bold text-lg lg:text-2xl" style={
                {
                  fontFamily: 'Inter, sans-serif',
                }
              }>
                Level of Responsibility: Set strategy, inspire, mobilise
              </h1>
            </div>
          </div>

          {/* Progress Line */}
          <div className="hidden md:block relative mb-8">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#686868] rounded-full"></div>
              <div className="flex-1 h-0.5 bg-[#686868]"></div>
              <div className="w-3 h-3 bg-[#686868] rounded-full"></div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-6 lg:gap-8 relative">
            {/* Left Side - Navigation Arrows */}
            <div className="space-y-6 lg:space-y-8">
              {/* Description/Guidance notes */}
              <div className="relative">
                <div className="flex items-center bg-[#C3E0FF] border-2 border-[#6BB2FD] h-16 lg:h-14 relative overflow-hidden"
                  style={{
                    clipPath: 'polygon(12px 0%, 100% 0%, 100% 100%, 12px 100%, 0% 50%)',
                    borderRadius: '12px 10px 10px 12px'
                  }}>
                  <div className="ml-12 lg:ml-14 flex-1 pr-3">
                    <span className="text-[#393939] font-bold text-base lg:text-sm leading-tight" style={
                      {
                        fontFamily: 'Inter, sans-serif',
                      }
                    }>
                      Description/<br />Guidance notes
                    </span>
                  </div>
                  <div className="relative mr-2">
                    <div className="w-12 h-12 lg:w-10 lg:h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <img
                        src="https://api.builder.io/api/v1/image/assets/TEMP/99356ec313277fe8adcfe73d47f1b723b77e049a?width=91"
                        alt="Information icon"
                        className="w-6 h-6 lg:w-5 lg:h-5"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Responsibility Attribute */}
              <div className="relative">
                <div className="flex items-center bg-[#FFC8B8] border-2 border-[#FF8360] h-16 lg:h-14 relative overflow-hidden"
                  style={{
                    clipPath: 'polygon(12px 0%, 100% 0%, 100% 100%, 12px 100%, 0% 50%)',
                    borderRadius: '12px 10px 10px 12px'
                  }}>
                  <div className="ml-12 lg:ml-14 flex-1 pr-3">
                    <span className="text-[#393939] font-bold text-base lg:text-sm" style={
                      {
                        fontFamily: 'Inter, sans-serif',
                      }
                    }>
                      Responsibility Attribute
                    </span>
                  </div>
                  <div className="relative mr-2">
                    <div className="w-12 h-12 lg:w-10 lg:h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <img
                        src="https://api.builder.io/api/v1/image/assets/TEMP/99356ec313277fe8adcfe73d47f1b723b77e049a?width=91"
                        alt="Information icon"
                        className="w-6 h-6 lg:w-5 lg:h-5"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Business skills / Behavioral factors */}
              <div className="relative">
                <div className="flex items-center bg-[#88E9D9] border-2 border-[#38C0AA] h-16 lg:h-14 relative overflow-hidden"
                  style={{
                    clipPath: 'polygon(12px 0%, 100% 0%, 100% 100%, 12px 100%, 0% 50%)',
                    borderRadius: '12px 10px 10px 12px'
                  }}>
                  <div className="ml-12 lg:ml-14 flex-1 pr-3">
                    <span className="text-[#393939] font-bold text-base lg:text-sm text-center leading-tight" style={
                      {
                        fontFamily: 'Inter, sans-serif',
                      }
                    }>
                      Business skills /<br />Behavioral factors
                    </span>
                  </div>
                  <div className="relative mr-2">
                    <div className="w-12 h-12 lg:w-10 lg:h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <img
                        src="https://api.builder.io/api/v1/image/assets/TEMP/99356ec313277fe8adcfe73d47f1b723b77e049a?width=91"
                        alt="Information icon"
                        className="w-6 h-6 lg:w-5 lg:h-5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Line - positioned in the gap between columns */}
            <div className="hidden lg:block absolute left-[450px] top-[-10px] w-1 h-76 bg-[#686868] rounded-xl transform translate-x-3"></div>

            {/* Right Side - Content Sections */}
            <div className="space-y-4 lg:space-y-6">
              {/* Description Section */}
              <div className="bg-white border-2 border-[#BFDEFF] rounded-xl lg:rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-[#47A0FF] px-4 lg:px-6 py-3 lg:py-4">
                  <h2 className="text-white font-bold text-xl lg:text-lg" style={
                    {
                      fontFamily: 'Inter, sans-serif',
                    }
                  }>Description</h2>
                </div>
                <div className="p-4 lg:p-6">
                  <p className="text-black text-base lg:text-sm leading-relaxed" style={
                    {
                      fontFamily: 'InterMedium, sans-serif',
                    }
                  }>
                    Essence of the level: Operates at the highest organizational level, determines overall organizational vision and strategy, and assumes accountability for overall success.
                  </p>
                </div>
              </div>

              <div className="relative max-w-4xl w-full mx-auto bg-white rounded-[20px] shadow-md border border-[#C3E0FF]">
                {/* Header */}
                <div className="bg-[#3C9EFF] rounded-t-[20px] px-6 py-4">
                  <h2 className="text-white text-xl font-bold" style={
                    {
                      fontFamily: 'Inter, sans-serif',
                    }
                  }>Guidance notes</h2>
                </div>

                {/* Body */}
                <div className="relative p-5 text-[#333] text-black text-sm lg:text-sm leading-relaxed z-10" style={
                  {
                    fontFamily: 'InterMedium, sans-serif',
                  }
                }>
                  <p className="mb-3">
                    Levels represent levels of responsibility in the workplace. Each successive level describes increasing impact, responsibility and accountability.
                    – Autonomy, influence and complexity are generic attributes that indicate the level of responsibility.
                    – Business skills and behavioral factors describe the behaviors required to be effective at each level.
                  </p>
                  <p className="pr-[96px]">
                    – The knowledge attribute defines the depth and breadth of understanding required to perform and influence work effectively.
                    Understanding these attributes will help you get the most out of levels.
                    They are critical to understanding and applying the levels described in skill descriptions.
                  </p>
                </div>

                {/* Bottom-right Icon (cut-out style) */}
                <div className="absolute bottom-[-10.5px] right-[-9px] z-20">
                  <div className="w-34 h-34 bg-white rounded-full flex items-center justify-center border-4 border-white">
                    <img
                      src="/Screenshot 2025-07-26 015219.png"
                      alt="Guidance Icon"
                      className="w-104 h-104 object-contain"
                    />
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
