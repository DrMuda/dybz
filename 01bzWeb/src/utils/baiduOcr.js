import axios from "axios";

class ocr{
    imageList = []
    request(imgBase64){
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.setAttribute("height", 25);
        canvas.setAttribute("width", 25);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, 25, 25);
        const img = new Image();
        img.src = imgBase64.replace("data:text/html", "data:image/png");
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            this.imageList.push(canvas.toDataURL())
        }

    }
    push(imgBase64){
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.setAttribute("height", 25);
        canvas.setAttribute("width", 25);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, 25, 25);
        const img = new Image();
        img.src = imgBase64.replace("data:text/html", "data:image/png");
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            this.imageList.push(canvas.toDataURL())
            if(this.imageList.length>1){
                startRequest()
            }
        }
    }
}
export default (imgBase64) => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.setAttribute("height", 25);
        canvas.setAttribute("width", 25);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, 25, 25);
        const img = new Image();
        img.src = imgBase64.replace("data:text/html", "data:image/png");
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            axios({
                url: "/baiduocr/general_basic",
                method: "post",
                params: {
                    access_token: "24.f1f83f60260139a836e1b08f05e04459.2592000.1649507826.282335-25293048",
                    image: canvas.toDataURL(),
                },
            })
                .then(
                    (res) => {
                        resolve(res.data);
                        console.log(res.data)
                    },
                    () => {
                        reject("error");
                    }
                )
                .catch(() => {
                    reject("error");
                });
        };
    });
};
