import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // 네임스페이스 지정 필요
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"; // 사용자 실제 경로 확인 필요
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";   // 사용자 실제 경로 확인 필요
import logger from '@/shared/utils/logger';
// import { Button } from '@/components/ui/button'; // 필요 시 사용

interface ImageMeta {
    id: string;
    url: string;
    width: number;
    height: number;
    source: string;
    author?: string;
}

const generateImageUrl = (index: number, width = 600, height = 400) => {
    return `https://picsum.photos/${width}/${height}?random=${index + 1}`;
};

export default function PhotoPage() {
    const { t } = useTranslation(['common', 'demo']); // 네임스페이스 지정
    const [images, setImages] = useState<ImageMeta[]>([]);
    // selectedImage는 Dialog에 표시할 데이터를 결정하는 데만 사용
    const [selectedImageForDialog, setSelectedImageForDialog] = useState<ImageMeta | null>(null);
    // isDialogOpen은 어떤 Dialog든 열려있는지 여부 (또는 Dialog별 상태 관리도 가능하나 복잡해짐)
    // 여기서는 하나의 Dialog만 동시에 열린다고 가정하고, selectedImageForDialog 유무로 판단

    useEffect(() => {
        const generateAndSetImages = async () => {
            logger.debug("Attempting to generate images...");
            const newImages: ImageMeta[] = [];
            for (let i = 0; i < 10; i++) {
                const width = 600 + Math.floor(Math.random() * 100) - 50;
                const height = 400 + Math.floor(Math.random() * 100) - 50;
                const imageUrl = generateImageUrl(i, width, height);
                newImages.push({
                    id: `image-${i}`,
                    url: imageUrl,
                    width: width,
                    height: height,
                    source: 'picsum.photos',
                });
            }
            setImages(newImages);
            logger.debug("Generated images:", newImages);
        };
        generateAndSetImages();
    }, []);

    // Dialog의 open 상태를 외부에서 제어하기보다, 각 Dialog가 Trigger와 Content를 함께 갖도록 구조 변경
    // 클릭 시 selectedImageForDialog를 설정하고, DialogContent는 이 값을 참조하여 내용을 표시합니다.

    if (images.length === 0) {
        return <div className="p-4 text-center">{t('common:loading')}</div>; // common 네임스페이스
    }

    return (
        <div className="container mx-auto p-4 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-8 text-center">{t('demo:photoPage.galleryTitle')} 🖼️</h1>
            <Carousel
                opts={{
                    align: "center",
                    loop: true,
                    slidesToScroll: 1,
                }}
                className="w-full max-w-3xl"
            >
                <CarouselContent>
                    {images.map((image, index) => (
                        <CarouselItem key={image.id} className="flex justify-center">
                            <div className="p-1 w-full flex justify-center">
                                <Dialog onOpenChange={(open) => {
                                    if (!open) setSelectedImageForDialog(null);
                                }}>
                                    <DialogTrigger asChild onClick={() => setSelectedImageForDialog(image)}>
                                        <div className="aspect-[3/2] w-full max-w-full overflow-hidden rounded-lg shadow-lg cursor-pointer group">
                                            <img
                                                src={image.url}
                                                alt={`Random pic ${index + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105 group-hover:opacity-90"
                                            />
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[525px] bg-white rounded-xl shadow-2xl p-0">
                                        {selectedImageForDialog && selectedImageForDialog.id === image.id && (
                                            <>
                                                <DialogHeader className="p-6 pb-4">
                                                    <DialogTitle className="text-xl font-semibold text-gray-800">{t('demo:photoPage.dialogTitle')}</DialogTitle>
                                                    <DialogDescription className="text-sm text-gray-500">
                                                        {t('demo:photoPage.dialogDesc', { id: selectedImageForDialog.id })}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 p-6 pt-0">
                                                    <div className="w-full aspect-[3/2] overflow-hidden rounded-md mb-4 bg-gray-100">
                                                        <img src={selectedImageForDialog.url} alt={selectedImageForDialog.id} className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="grid gap-3 text-sm">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-500 font-medium">{t('demo:photoPage.meta.id')}:</span>
                                                            <span className="font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{selectedImageForDialog.id}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-500 font-medium">{t('demo:photoPage.meta.requestedWidth')}:</span>
                                                            <span className="text-gray-700">{selectedImageForDialog.width}px</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-500 font-medium">{t('demo:photoPage.meta.requestedHeight')}:</span>
                                                            <span className="text-gray-700">{selectedImageForDialog.height}px</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-500 font-medium">{t('demo:photoPage.meta.source')}:</span>
                                                            <a
                                                                href={`https://${selectedImageForDialog.source}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                                                            >
                                                                {selectedImageForDialog.source}
                                                            </a>
                                                        </div>
                                                        {selectedImageForDialog.author && (
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-gray-500 font-medium">{t('demo:photoPage.meta.author')}:</span>
                                                                <span className="text-gray-700">{selectedImageForDialog.author}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col items-start gap-1 pt-2 border-t border-gray-200 mt-2">
                                                            <span className="text-gray-500 font-medium">{t('demo:photoPage.meta.url')}:</span>
                                                            <a
                                                                href={selectedImageForDialog.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="w-full text-blue-600 hover:text-blue-700 hover:underline truncate block"
                                                                title={selectedImageForDialog.url}
                                                            >
                                                                {selectedImageForDialog.url}
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 hidden sm:flex disabled:opacity-50" />
                <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 hidden sm:flex disabled:opacity-50" />
            </Carousel>
        </div>
    );
} 