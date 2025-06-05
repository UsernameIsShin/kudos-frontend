export default function UserOverview() {
    return (
        <section className="p-6 space-y-6 ml-2">
            <div className="text-xl font-semibold ml-2 text-[#838b9f]">대시보드</div>
            <div className="flex items-center gap-2 mb-6">
                <div className="relative">
                    <select
                        className="appearance-none py-1 pl-2.5 pr-8 text-[10px] text-black border border-[#cad1dd] rounded-[5px] bg-white bg-no-repeat bg-[length:12px] cursor-pointer">
                        <option value="지난 1년">지난 1년</option>
                        <option value="지난 6개월">지난 6개월</option>
                        <option value="지난 3개월">지난 3개월</option>
                    </select>
                </div>
                <div className="relative flex items-center">
                    <input
                        type="date"
                        placeholder="2019"
                        className="font-pretendard py-1 px-3 mx-[5px] border border-[#cad1dd] rounded-[5px] text-[10px]"
                    />
                    <span className="mx-2">-</span>
                    <input
                        type="date"
                        placeholder="2023"
                        className="font-pretendard py-1 px-3 mx-[5px] border border-[#cad1dd] rounded-[5px] text-[10px]"
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-md p-4 h-[320px]">
                    <div className="mb-4 flex justify-start gap-1 items-center pb-2 border-b border-gray-200">
                        <span className="font-medium ml-2">투자총액</span>
                        <a href="#" className="hover:opacity-80">
                            <img src="/images/question-fill-1@2x.png" alt="도움말" className="w-5 h-5" />
                        </a>
                    </div>
                    <div className="flex items-start h-full">
                        <div className="text-2xl font-bold">100,000,000 원</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-4 h-[320px]">
                    <div className="mb-4 flex justify-start gap-1 items-center pb-2 border-b border-gray-200">
                        <span className="font-medium ml-2">회수총액</span>
                        <a href="#" className="hover:opacity-80">
                            <img src="/images/question-fill-1@2x.png" alt="도움말" className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-4 h-[320px]">
                    <div className="mb-4 flex justify-start gap-1 items-center pb-2 border-b border-gray-200">
                        <span className="font-medium ml-2">투자 유형 별 포트폴리오 수</span>
                        <a href="#" className="hover:opacity-80">
                            <img src="/images/question-fill-1@2x.png" alt="도움말" className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-md p-4 h-[320px]">
                    <div className="mb-4 flex justify-start gap-1 items-center pb-2 border-b border-gray-200">
                        <span className="font-medium ml-2">투자 건 수</span>
                        <a href="#" className="hover:opacity-80">
                            <img src="/images/question-fill-1@2x.png" alt="도움말" className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-4 h-[320px]">
                    <div className="mb-4 flex justify-start gap-1 items-center pb-2 border-b border-gray-200">
                        <span className="font-medium ml-2">투자 건 IRR</span>
                        <a href="#" className="hover:opacity-80">
                            <img src="/images/question-fill-1@2x.png" alt="도움말" className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-4 h-[320px]">
                    <div className="mb-4 flex justify-start gap-1 items-center pb-2 border-b border-gray-200">
                        <span className="font-medium ml-2">기업 가치</span>
                        <a href="#" className="hover:opacity-80">
                            <img src="/images/question-fill-1@2x.png" alt="도움말" className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
} 