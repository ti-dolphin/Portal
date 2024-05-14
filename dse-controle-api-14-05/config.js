
module.exports = SERVER = {
    BASE_URL : "localhost",
    PORT     : 1100
};

module.exports = DATABASE = {
    HOST     : process.env.HOST,
    PORT     : 3306,
    USER     : process.env.USER,
    PASSWORD : process.env.PASSWORD,
    DATA_BASE: process.env.DATA_BASE,
    charset : 'utf8mb4_bin'
}

module.exports = CREDENTIALS = {
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
};

module.exports = EMAIL = {
    HOST: "smtp.gmail.com",
    USER: "dev@roxcode.io",
    KEY: "CBBC20F898D3975C80AD02AE126BC1FF2379E9F11966FA2FFB9C4198FD6B9A0A1D5F071C2AC163637CA8FA0282651A97",
    PASSWORD: "jevhtoxkefymyxzq",
    PORT: 465,
}

module.exports = NODEMAILERTRANSPORT = { 
    host: "email-ssl.com.br",
    port: 587,
    secure: false,
    auth: { 
        user: "dev@roxcode.dev", 
        pass: "Rox!351728" 
    }
};