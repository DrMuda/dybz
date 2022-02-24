<template>
    <div id="main-context"></div>
</template>

<script>
import axios from "axios";
export default {
    name: "Home",
    props: {
        msg: String,
    },
    mounted: () => {
        axios
            .get("/getHtml/10/10967/211316", {
                responseType: "blob",
                transformResponse: [
                    async function (data) {
                        return new Promise((reslove) => {
                            let reader = new FileReader();
                            reader.readAsText(data, "GBK");
                            reader.onload = function () {
                                reslove(reader.result);
                            };
                        });
                    },
                ],
            })
            .then(async function (res) {
                // 获取网页数据
                let content = await res.data;

                document.getElementById("main-context").innerText = content;
            })
            .catch(function (err) {
                console.log("failed", err);
            });
    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
