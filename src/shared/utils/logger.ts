import log from 'loglevel';

// 현재 환경 모드 가져오기 (Vite)
const currentMode = import.meta.env.MODE;

// 기본 로그 레벨 설정
if (currentMode === 'production') {
    // 프로덕션 모드: WARN 레벨 이상의 로그만 출력 (warn, error)
    log.setLevel(log.levels.WARN);
} else {
    // 개발 모드 (또는 기타 모드): TRACE 레벨 이상의 모든 로그 출력 (trace, debug, info, warn, error)
    log.setLevel(log.levels.DEBUG);
}

// 필요하다면, 로그 출력 형식 등을 커스터마이즈 할 수 있습니다.
// 예: log.methodFactory = function (methodName, logLevel, loggerName) {
//     return function (message) {
//         console.log(`[${new Date().toISOString()}] ${methodName.toUpperCase()}:`, message);
//     };
// };

export default log; 