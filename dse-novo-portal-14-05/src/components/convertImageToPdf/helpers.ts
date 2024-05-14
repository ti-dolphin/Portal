import jsPDF from "jspdf";
import imageCompression from 'browser-image-compression';
import { CustomImage } from "./custom-image";

const A4_PAPER_DIMENSIONS = {
  width: 210,
  height: 297,
};

const A4_PAPER_RATIO = A4_PAPER_DIMENSIONS.width / A4_PAPER_DIMENSIONS.height;

interface ImageDimension {
  width: number;
  height: number;
}

export const imageDimensionsOnA4 = (dimensions: ImageDimension) => {
  const isLandscapeImage = dimensions.width >= dimensions.height;

  if (isLandscapeImage) {
    return {
      width: A4_PAPER_DIMENSIONS.width,
      height:
        dimensions.height * (A4_PAPER_DIMENSIONS.width / dimensions.width)
    };
  } else{
    const imageRatio = dimensions.width / dimensions.height;
    if(A4_PAPER_RATIO > imageRatio){
      return {
        width: dimensions.width * (A4_PAPER_DIMENSIONS.height / dimensions.height),
        height: A4_PAPER_DIMENSIONS.height
      };
    } else{
      return {
        width: A4_PAPER_DIMENSIONS.width,
        height: dimensions.height * (A4_PAPER_DIMENSIONS.width / dimensions.width)
      };
    }
  }
};

export const fileToImageURLArray = (file: File[]): Promise<CustomImage> => {
  return new Promise( async (resolve, reject) => {
    var imgs = []
    const options = {
      maxSizeMB: 3,
      useWebWorker: true
    }

    for(let f of file){
      if(f.type.includes('image')){
        console.log('FILE2')
        Object.keys(f).forEach((key) =>{
          console.log(f[key as keyof File])
        })
        f = await imageCompression(f, options);
        var img = await fileToImageURL(f)
        console.log('IMAGEEEEEE')
        Object.keys(img).forEach((key) =>{
          console.log(img[key as keyof CustomImage])
        })
        imgs.push(img)
      }
    }
    resolve(imgs)
  })
}

export const fileToImageURL = (file: File): Promise<CustomImage> => {
  return new Promise((resolve, reject) => {
    const image = new CustomImage(file.type);
    image.src = URL.createObjectURL(file);
    Object.keys(file).forEach((key) =>{
      console.log(file[key as keyof File])
    })

    image.onload = async () => {
      resolve(image);
    };

    image.onerror = () => {
      reject(new Error("Failed to convert File to Image"));
    };
    
  });
};

export const generatePdfFromImages = async (images: CustomImage[] ) => {
  return new Promise(async (resolve, reject) => {
    const doc = new jsPDF();
    doc.deletePage(1);
  
    images.forEach((image) => {
      const imageDimensions = imageDimensionsOnA4({
        width: image.width,
        height: image.height,
      });
      console.log('IMAGE SRC')
      console.log(image.src)
  
      doc.addPage();
      doc.addImage(
        image.src,
        image.imageType,
        (A4_PAPER_DIMENSIONS.width - imageDimensions.width) / 2,
        (A4_PAPER_DIMENSIONS.height - imageDimensions.height) / 2,
        imageDimensions.width,
        imageDimensions.height
      );
    });
  
    const pdfURL = doc.output("bloburl");
  
    var file = await CreateFile(pdfURL,'teste.pdf')
  
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload=(e)=>{
      resolve(e)
    }
  
    // window.open(pdfURL as any, "_blank");
  });
};

export const CreateFile = async(pdfURL: any, docName: any) => {
  let response = await fetch(pdfURL);
  let data = await response.blob();
  let metadata = {
    type: 'pdf'
  };
  let file = new File([data], docName, metadata);

  return file
}

