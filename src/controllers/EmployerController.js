import {authGoogle, authKakao, ReadEmployer, registerEmployerService} from "../services/EmployerService.js";
import TokenResponseDTO from "../dto/employerdto/TokenResponseDTO.js";
import JWTUtil from "../security/util/JWTUtil.js";


const kakaoLogin = async (req, res) => {

    console.log("1111111111111")

    const { accessToken } = req.query;
    console.log(accessToken);


    const EmployerDTO = await authKakao(accessToken); //emp dto를 generateTokenResponse 를 통해서 현재 userdto + token을 만들어서 tokenresponsedto를 완성

    console.log("77777777777777")

    const tokenResponseDTO = await generateTokenResponseDTO(EmployerDTO);

    console.log("1010101010101010")


    res.status(200).json({
        status: 'success',
        data: tokenResponseDTO,
    })

}

const GoogleLogin = async (req, res) => {

    console.log("1111111111111111")

    const { accessToken } = req.query;
    console.log(accessToken);

    const EmployerDTO = await authGoogle(accessToken);

    console.log("777777777777")

    const tokenResponseDTO = await generateTokenResponseDTO(EmployerDTO);

    console.log("1010101010101010")

    res.status(200).json({
        status: 'success',
        data: tokenResponseDTO,
    })

}

const registerEmployer = async (req, res) => {

    console.log("registerEmployer")

    const { eno } = req.params;
    const EmployerRegisterDTO = req.body;

    await registerEmployerService(eno, EmployerRegisterDTO);

    res.status(200).json({
        status: 'success',
        data: EmployerRegisterDTO,
    })

}

const generateTokenResponseDTO = async (EmployerDTO) => {

    console.log("888888888888")

    const claimMap = {
        email: EmployerDTO.eemail
    };

    const accessToken = JWTUtil.createToken(claimMap, 2);
    const refreshToken = JWTUtil.createToken(claimMap, 1000);

    const tokenResponseDTO = new TokenResponseDTO(
        EmployerDTO.eno,
        EmployerDTO.eemail,
        EmployerDTO.ename,
        accessToken,
        refreshToken,
        EmployerDTO.isNew
    )

    console.log(tokenResponseDTO)

    console.log("999999999999999")

    return tokenResponseDTO;


}

const EmployerRead = async (req, res) => {

    console.log("EmployerRead")

    const { eno }= req.params;

    const EmployerReadDTO = await ReadEmployer(eno);

    res.status(200).json({
        status: 'success',
        data: EmployerReadDTO,
    })

}

// const refreshToken = (req, res) => {
//
//     const accessToken = req.headers.authorization;
//
//     const {refreshToken} = req.query;
//
//     if(accessToken === null || refreshToken === null) {
//         throw new Error("accessToken is required");
//     }
//
//     if(!accessToken.startsWith("Bearer ")) {
//         throw new Error("accessToken is required")
//     }
//
//     const accessTokenStr = accessToken.substring("Bearer ".length);
//
//     try {
//
//         const payload = JWTUtil.validateToken(accessTokenStr);
//         const eemail = payload.eemail;
//
//         return res.status(200).json({
//             accessToken: accessTokenStr,
//             refreshToken,
//             eemail,
//         })
//
//     }catch(accessError) {
//         if (accessError.name === "TokenExpiredError") {
//             try {
//                 const refreshpayload = JWTUtil.validateToken(refreshToken);
//                 const eemail = refreshpayload.eemail;
//
//                 let newAccessToken = null;
//                 let newRefreshToken = null;
//
//                 if(true) {
//                     const claimMap = { eemail }
//                     newAccessToken = JWTUtil.createToken(claimMap, 1);
//                     newRefreshToken = JWTUtil.createToken(claimMap, 1000);
//                 }
//                 return res.status(200).json({
//                     accessToken: newAccessToken,
//                     refreshToken: newRefreshToken,
//                     eemail,
//                 })
//             } catch (refreshError) {
//                 if(refreshError.name === "TokenExpiredError") {
//                     return res.status(401).json({
//                         error: "Require sign-in"
//                     })
//                 }
//                 return res.status(400).json({error: "Invalid refresh token"})
//             }
//         }
//         return res.status(400).json({
//             error: "Invalid refresh token"
//         })
//     }
//
// }

const refreshToken = (req, res) => {

    const { refreshToken } = req.query;  // refreshToken은 query에서 받아옵니다.

    if (refreshToken === null) {
        return res.status(400).json({
            error: "refreshToken is required"
        });
    }

    try {
        // refreshToken을 유효성 검사
        const refreshPayload = JWTUtil.validateToken(refreshToken);
        const eemail = refreshPayload.eemail;

        // 새로 발급할 accessToken과 refreshToken 생성
        const claimMap = { eemail };

        const newAccessToken = JWTUtil.createToken(claimMap, 1);  // 1분 유효 기간
        const newRefreshToken = JWTUtil.createToken(claimMap, 1000);  // 1000분 유효 기간

        return res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            eemail,
        });

    } catch (refreshError) {
        if (refreshError.name === "TokenExpiredError") {
            return res.status(401).json({
                error: "Require sign-in"
            });
        }
        return res.status(400).json({
            error: "Invalid refresh token"
        });
    }
}
export { kakaoLogin, GoogleLogin, registerEmployer, EmployerRead, refreshToken }