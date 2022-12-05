const fs = require("fs");

const read = () => {
    const newData = fs.readFile("newData.json", "utf8", (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        return JSON.stringify(data); //undefined ??
    });

    // const compare = newData.forEach((item) => {
    //     console.log(item.title);
    // });

    console.log(newData);
};

export default read;
