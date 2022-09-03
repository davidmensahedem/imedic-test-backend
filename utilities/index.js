const generateOrderCode = function () {
          
    // Declare a string variable which stores all string

    var string = process.env.ORDER_CODE_KEY;
    let code = '';
      
    // Find the length of string
    var len = string.length;
    for (let i = 0; i < 6; i++ ) {
        code += string[Math.floor(Math.random() * len)];
    }

    return code;
}


module.exports = generateOrderCode;