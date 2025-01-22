import Employer from "../models/Employer.js";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

const authKakao = async (accessToken) => {
    console.log("-------------authKakaoService-------------");

    const { email, name } = await getEmailFromKakaoAccessToken(accessToken);

    console.log("email: " + email);

    return await returnMember(email, name);
};

const returnMember = async (eemail) => {
    console.log("444444444444444444");

    const user = await Employer.findOne({ where: { eemail }});

    console.log(user);

    if (user) {
        return {
            eno: user.eno,
            eemail: user.eemail,
            epw: user.epw,
            ename: user.ename,
            ebirth: user.ebirth,
            egender: user.egender,
            edelete: user.edelete,
        };
    }

    // 사용자가 없으면 새로운 사용자 생성
    const newPassword = uuidv4();
    const newUser = await Employer.create({
        eemail,
        epw: newPassword,
        ename: "",
        ebirth: null,
        egender: "",
    });

    console.log("555555555555555");

    return {
        eno: newUser.eno,
        eemail: newUser.eemail,
        epw: newUser.epw,
        ename: newUser.ename,
        ebirth: newUser.ebirth,
        egender: newUser.egender,
        edelete: newUser.edelete,
    };
};

// 카카오 액세스 토큰을 통해 이메일을 추출
const getEmailFromKakaoAccessToken = async (accessToken) => {
    console.log("222222222222222");

    const KakaoGetUserURL = 'https://kapi.kakao.com/v2/user/me';

    const response = await axios.get(KakaoGetUserURL, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    const kakaoAccount = response.data.kakao_account;


    console.log("333333333333333333");

    return { email: kakaoAccount.email };
};

export { authKakao, returnMember, getEmailFromKakaoAccessToken };