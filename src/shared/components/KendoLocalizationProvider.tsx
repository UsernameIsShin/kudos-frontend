import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { IntlProvider, LocalizationProvider, loadMessages, load } from "@progress/kendo-react-intl";

// CLDR 데이터 import
import likelySubtags from "cldr-core/supplemental/likelySubtags.json";
import currencyData from "cldr-core/supplemental/currencyData.json";
import weekData from "cldr-core/supplemental/weekData.json";

// 한국어 CLDR 데이터
import numbersKo from "cldr-numbers-full/main/ko/numbers.json";
import caGregorianKo from "cldr-dates-full/main/ko/ca-gregorian.json";
import dateFieldsKo from "cldr-dates-full/main/ko/dateFields.json";
import timeZoneNamesKo from "cldr-dates-full/main/ko/timeZoneNames.json";
import currenciesKo from "cldr-numbers-full/main/ko/currencies.json";

// 영어 CLDR 데이터
import numbersEn from "cldr-numbers-full/main/en/numbers.json";
import caGregorianEn from "cldr-dates-full/main/en/ca-gregorian.json";
import dateFieldsEn from "cldr-dates-full/main/en/dateFields.json";
import timeZoneNamesEn from "cldr-dates-full/main/en/timeZoneNames.json";
import currenciesEn from "cldr-numbers-full/main/en/currencies.json";

// Kendo UI 로케일 메시지
import kendoMessagesKo from '@/assets/locales/kendo/ko.json';
import kendoMessagesEn from '@/assets/locales/kendo/en.json';

// CLDR 데이터 로드 (앱 초기화 시 한 번만 실행)
let isCldrLoaded = false;

const loadCldrData = () => {
    if (isCldrLoaded) return;

    // 한국어 데이터 로드
    load(
        likelySubtags,
        currencyData,
        weekData,
        numbersKo,
        caGregorianKo,
        dateFieldsKo,
        timeZoneNamesKo,
        currenciesKo
    );

    // 영어 데이터 로드
    load(
        likelySubtags,
        currencyData,
        weekData,
        numbersEn,
        caGregorianEn,
        dateFieldsEn,
        timeZoneNamesEn,
        currenciesEn
    );

    // Kendo UI 메시지 로드
    loadMessages(kendoMessagesKo, 'ko');
    loadMessages(kendoMessagesEn, 'en');

    isCldrLoaded = true;
};

interface KendoLocalizationProviderProps {
    children: ReactNode;
}

export default function KendoLocalizationProvider({ children }: KendoLocalizationProviderProps) {
    const { i18n } = useTranslation();

    // CLDR 데이터 로드
    loadCldrData();

    // i18next 언어에 따라 Kendo 로케일 결정
    const currentKendoLocale = i18n.language.startsWith('ko') ? 'ko' : 'en';

    return (
        <LocalizationProvider language={currentKendoLocale}>
            <IntlProvider locale={currentKendoLocale}>
                {children}
            </IntlProvider>
        </LocalizationProvider>
    );
} 