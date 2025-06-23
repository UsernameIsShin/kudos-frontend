import { useState, useEffect } from "react";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Button } from "@progress/kendo-react-buttons";
import { callApi } from "@/shared/api/apiService";
import logger from "@/shared/utils/logger";
import PageHeader from "@/shared/components/common/PageHeader";

// API 요청 데이터 타입 정의
interface DropDownListReq {
  limitCount: number;
}
interface DropDownListData {
  code: string;
  kn: string;
}

export default function UserOverview() {
  // 컴포넌트 내부에서 사용할 상태들
  const [options, setOptions] = useState<DropDownListData[]>([]);
  const [selectedOption, setSelectedOption] = useState<DropDownListData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [, setSearchLoading] = useState(false);

  // API 호출 함수
  const fetchOptions = async () => {
    try {
      setLoading(true);
      const request: DropDownListReq = {
        limitCount: 100,
      };

      // callApi의 제네릭 타입에 실제 data의 타입을 지정
      const response = await callApi<DropDownListData[]>(
        `/eum/sample/selectSampleOptionList`,
        request
      );

      if (response.success && response.data) {
        setOptions(response.data); // 타입 단언 없이 직접 할당
      } else {
        console.error("API 응답 오류:", response.message);
        setOptions([]); // 오류 발생 시 빈 배열로 초기화
      }
    } catch (error) {
      console.error("API 호출 실패:", error);
      setOptions([]); // 오류 발생 시 빈 배열로 초기화
    } finally {
      setLoading(false);
    }
  };

  // 페이지 로드 시 초기화
  useEffect(() => {
    fetchOptions();
  }, []);

  // 검색 버튼 클릭 핸들러
  const handleSearch = async () => {
    logger.debug("검색 버튼 클릭:", selectedOption);
    setSearchLoading(true);
    try {
      const request = {
        code: selectedOption?.code,
      };

      const response = await callApi<any>(
        `/eum/sample/selectCADetail`,
        request
      );

      if (response.success && response.data) {
        setSearchResult(response.data);
        logger.info("검색 결과:", response.data);
      } else {
        logger.error("검색 API 응답 오류:", response.message);
        setSearchResult(null);
      }
    } catch (error) {
      logger.error("검색 API 호출 실패:", error);
      setSearchResult(null);
    } finally {
      setSearchLoading(false);
    }
  };

  // DropDownList 텍스트 필드 설정
  const textField = "kn";
  const dataItemKey = "code";

  return (
    <div>
      <section>
        <PageHeader />
      </section>
      <section className="p-6 space-y-6 ml-2">
        <div className="text-xl font-semibold ml-2 text-[#838b9f]">
          대시보드
        </div>
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-4 w-92">
            <DropDownList
              data={options}
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.value)}
              textField={textField}
              dataItemKey={dataItemKey}
              loading={loading}
              popupSettings={{ height: "200px" }}
            />
            <Button
              themeColor="primary"
              onClick={handleSearch}
              disabled={loading}
            >
              검색
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-4 h-[320px]">
            <div className="mb-4 flex justify-start gap-1 items-center pb-2 border-b border-gray-200">
              <span className="font-medium ml-2">기업명</span>
              <a href="#" className="hover:opacity-80">
                <img
                  src="/images/question-fill-1@2x.png"
                  alt="도움말"
                  className="w-5 h-5"
                />
              </a>
            </div>
            <div className="flex items-start h-full">
              <div className="text-2xl font-bold">
                {searchResult && searchResult?.kn}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 h-[320px]">
            <div className="mb-4 flex justify-start gap-1 items-center pb-2 border-b border-gray-200">
              <span className="font-medium ml-2">기업영문명</span>
              <a href="#" className="hover:opacity-80">
                <img
                  src="/images/question-fill-1@2x.png"
                  alt="도움말"
                  className="w-5 h-5"
                />
              </a>
            </div>
            <div className="flex items-start h-full">
              <div className="text-2xl font-bold">
                {searchResult && searchResult?.en}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 h-[320px]">
            <div className="mb-4 flex justify-start gap-1 items-center pb-2 border-b border-gray-200">
              <span className="font-medium ml-2">GICS</span>
              <a href="#" className="hover:opacity-80">
                <img
                  src="/images/question-fill-1@2x.png"
                  alt="도움말"
                  className="w-5 h-5"
                />
              </a>
            </div>
            <div className="flex items-start h-full">
              <div className="text-2xl font-bold">
                {searchResult && searchResult?.gics}
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-4 h-[320px]">
            <div className="mb-4 flex justify-start gap-1 items-center pb-2 border-b border-gray-200">
              <span className="font-medium ml-2">투자 건 수</span>
              <a href="#" className="hover:opacity-80">
                <img
                  src="/images/question-fill-1@2x.png"
                  alt="도움말"
                  className="w-5 h-5"
                />
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 h-[320px]">
            <div className="mb-4 flex justify-start gap-1 items-center pb-2 border-b border-gray-200">
              <span className="font-medium ml-2">투자 건 IRR</span>
              <a href="#" className="hover:opacity-80">
                <img
                  src="/images/question-fill-1@2x.png"
                  alt="도움말"
                  className="w-5 h-5"
                />
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 h-[320px]">
            <div className="mb-4 flex justify-start gap-1 items-center pb-2 border-b border-gray-200">
              <span className="font-medium ml-2">기업 가치</span>
              <a href="#" className="hover:opacity-80">
                <img
                  src="/images/question-fill-1@2x.png"
                  alt="도움말"
                  className="w-5 h-5"
                />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
