import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SignupApi } from "../../api/Signup";
import IsModal from "../modal/Modal";
import Label from "../layout/Label";
import LoginSignupInputBox from "../input/LoginSignupInputBox";
import {
  __nickNameCheck,
  userInfoState,
  setSingup,
} from "../../redux/modules/SingupSlice";

const Signup = () => {
  //=============변수정리====================
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [style, setStyle] = useState({
    bgColorName: "bg-inputBox",
    bgColorEmail: "bg-inputBox",
    bgColorNickname: "bg-inputBox",
    bgColorPassword: "bg-inputBox",
    bgColorPasswordCheck: "bg-inputBox",
    shadowName: "",
    shadowEmail: "",
    shadowNickname: "",
    shadowPassword: "",
    shadowPasswordCheck: "",
  });
  const [isOpen, setOpen] = useState(false);
  const [ModalStr, setModalStr] = useState({
    modalTitle: "",
    modalMessage: "",
  });

  const { singup } = useSelector((state) => state.SingupSlice);
  const { nickNameDoubleCheck } = useSelector((state) => state.SingupSlice);

  const userNameRef = useRef();
  const userEmailRef = useRef();
  const userNickNameRef = useRef();
  const userPasswordRef = useRef();
  const PasswordCheckRef = useRef();

  //이름, 이메일, 비밀번호, 닉네임 정규 표현식
  const nameRegulationExp = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|]+$/;
  const emailRegulationExp =
    /^[a-zA-Z0-9+-\_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  const passwordRegulationExp = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/;
  const nickNameReglationExp = /^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,8}$/;

  //아이디 비밀번호가 틀렸을시 문구
  const [regulation, SetRegulation] = useState({
    regulationName: "",
    regulationEmail: "",
    regulationPassword: "",
    regulationPasswordCheck: "",
    regulationNickName: "",
  });

  //애러메시지 히든
  const [hidden, Sethidden] = useState({
    hiddenErrorMeassageName: true,
    hiddenErrorMeassaEmail: true,
    hiddenErrorMeassaNickName: true,
    hiddenErrorMeassaName: true,
    hiddenErrorMeassaPassword: true,
    hiddenErrorMeassaPasswordCheck: true,
  });

  //중복확인여부
  const [doubleCheck, setDoubleCheck] = useState({
    emailDoubleCheck: false,
    passwordDoubleCheck: false,
  });

  //모달창
  const onModalOpen = () => {
    setOpen({ isOpen: true });
  };
  const onMoalClose = () => {
    setOpen({ isOpen: false });
  };

  //=============== 항목별 유효성검사===================

  //이름
  const nameValidationTest = (nameValidation) => {
    if (!nameRegulationExp.test(nameValidation.value)) {
      SetRegulation(() => ({
        ...regulation,
        regulationName: "한글 또는 영어로 작성해주세요.",
      }));
      Sethidden(() => ({
        ...hidden,
        hiddenErrorMeassaName: false,
      }));
      nameValidationTest.focus();
      return;
    } else {
      Sethidden(() => ({
        ...hidden,
        hiddenErrorMeassaName: true,
      }));
    }
  };

  //이메일
  const emailValidationTest = (emailValidation) => {
    console.log(emailValidation);
    if (emailRegulationExp.test(emailValidation.value)) {
      Sethidden(() => ({
        ...hidden,
        hiddenErrorMeassaEmail: true,
      }));
    } else {
      SetRegulation(() => ({
        ...regulation,
        regulationEmail: "올바른 이메일 형식이 아닙니다.",
      }));
      Sethidden(() => ({
        ...hidden,
        hiddenErrorMeassaEmail: false,
      }));
      emailValidationTest.focus();
      return;
    }
  };

  //닉네임
  const nickNameValidationTest = (nickNameValidation) => {
    console.log(nickNameValidation);

    if (nickNameReglationExp.test(nickNameValidation.value)) {
      Sethidden(() => ({
        ...hidden,
        hiddenErrorMeassaNickName: true,
      }));
    } else {
      SetRegulation(() => ({
        ...regulation,
        regulationNickName: "글자수 2~8자와 한글,영문,숫자만 포함해주세요.",
      }));
      Sethidden(() => ({
        ...hidden,
        hiddenErrorMeassaNickName: false,
      }));
      nickNameValidation.focus();
      return;
    }
  };

  //비밀번호
  const passwordValidationTest = (passwordValidation) => {
    if (passwordRegulationExp.test(passwordValidation.value)) {
      Sethidden(() => ({
        ...hidden,
        hiddenErrorMeassaPassword: true,
      }));
    } else {
      SetRegulation(() => ({
        ...regulation,
        regulationPassword:
          "최소 8 자리에서 영대소문자와 숫자를 포함시켜주세요.",
      }));
      Sethidden(() => ({
        ...hidden,
        hiddenErrorMeassaPassword: false,
      }));
      passwordValidation.focus();
      return;
    }
  };

  //비밀번호 확인
  const passwordCheckValidationTest = (passwordCheckValidation) => {
    const passwordvalue = userPasswordRef.current.value;
    console.log(passwordvalue);
    if (passwordCheckValidation.value === passwordvalue) {
      setDoubleCheck(() => ({ ...doubleCheck, passwordDoubleCheck: true }));
      Sethidden(() => ({
        ...hidden,
        hiddenErrorMeassaPasswordCheck: true,
      }));
    } else {
      SetRegulation(() => ({
        ...regulation,
        regulationPasswordCheck: "비밀번호와 일치하는지 확인해주세요.",
      }));
      Sethidden(() => ({
        ...hidden,
        hiddenErrorMeassaPasswordCheck: false,
      }));
      passwordCheckValidation.focus();
      return;
    }
  };

  //====================중복확인===========================

  //이메일중복체크악시오스
  const emailDoubleCheckAxios = async (payload) => {
    await SignupApi.emailDoubleCheck(payload)
      .then((response) => {
        console.log(response);
        setModalStr({
          modalTitle: response.message,
          modalMessage: "",
        });
        onModalOpen();
        setDoubleCheck(() => ({
          ...doubleCheck,
          emailDoubleCheck: true,
        }));
      })
      .catch((error) => {
        const { data } = error.response;
        if (data.status === 400) {
          setModalStr({
            modalTitle: data.message,
            modalMessage: "이메일을 확인해주세요.",
          });
          onModalOpen();
        } else {
          console.log(error);
        }
      });
  };

  //이메일 중복확인
  const onEmailDoubleCheck = (event) => {
    event.preventDefault();

    const emailCurrent = userEmailRef.current;

    if (emailCurrent.value.trim() === "") {
      SetRegulation(() => ({
        ...regulation,
        regulationEmail: "이메일을 입력해주세요.",
      }));
      emailCurrent.focus();
      return;
    }

    emailDoubleCheckAxios({
      email: emailCurrent.value,
    });
  };

  //닉네임 중복확인
  const onNickNameCheck = (event) => {
    event.preventDefault();

    const nickNameCurrent = userNickNameRef.current;

    if (nickNameCurrent.value.trim() === "") {
      SetRegulation(() => ({
        ...regulation,
        regulationNickName: "닉네임을 입력해주세요.",
      }));
      Sethidden(() => ({
        ...hidden,
        hiddenErrorMeassaNickName: false,
      }));
      nickNameCurrent.focus();
      return;
    } else {
      Sethidden(() => ({
        ...hidden,
        hiddenErrorMeassaNickName: true,
      }));
    }
    dispatch(
      __nickNameCheck({
        nickname: nickNameCurrent.value,
        onModalOpen,
        setModalStr,
      })
    );
  };

  //==============유효성 검사==========================
  const onValidity = (event) => {
    const { id } = event.target;

    //ref 객체
    const userNameCurrent = userNameRef.current;
    const userEmailCurrent = userEmailRef.current;
    const userNickNameCurrent = userNickNameRef.current;
    const userPasswordCurrent = userPasswordRef.current;
    const userPasswordCheckCurrnet = PasswordCheckRef.current;

    //ref 값
    const nameValue = userNameCurrent.value;
    const emailValue = userEmailCurrent.value;
    const nickNameValue = userNickNameCurrent.value;
    const passwordValue = userPasswordCurrent.value;
    const passwordCheckValue = userPasswordCheckCurrnet.value;

    if (id === "userName") {
      console.log("userId");
      setStyle(() => ({
        ...style,
        bgColorName: "bg-inputBoxFocus",
        shadowName: "drop-shadow-inputBoxShadow",
      }));
      if (nameValue.trim() === "") {
        setStyle(() => ({
          ...style,
          bgColorName: "bg-inputBox",
          shadowName: "",
        }));
      }
      nameValidationTest(userNameCurrent);
    } else if (id === "userEmail") {
      console.log("userEmail");
      setStyle(() => ({
        ...style,
        bgColorEmail: "bg-inputBoxFocus",
        shadowEmail: "drop-shadow-inputBoxShadow",
      }));
      if (emailValue.trim() === "") {
        setStyle(() => ({
          ...style,
          bgColorEmail: "bg-inputBox",
          shadowEmail: "",
        }));
      }
      emailValidationTest(userEmailCurrent);
    } else if (id === "userNickName") {
      setStyle(() => ({
        ...style,
        bgColorNickname: "bg-inputBoxFocus",
        shadowNickname: "drop-shadow-inputBoxShadow",
      }));
      if (nickNameValue.trim() === "") {
        setStyle(() => ({
          ...style,
          bgColorNickname: "bg-inputBox",
          shadowNickname: "",
        }));
      }
      nickNameValidationTest(userNickNameCurrent);
    } else if (id === "userPassword") {
      setStyle(() => ({
        ...style,
        bgColorPassword: "bg-inputBoxFocus",
        shadowPassword: "drop-shadow-inputBoxShadow",
      }));
      if (passwordValue.trim() === "") {
        setStyle(() => ({
          ...style,
          bgColorPassword: "bg-inputBox",
          shadowPassword: "",
        }));
      }
      passwordValidationTest(userPasswordCurrent);
    } else if (id === "passwordCheck") {
      console.log("비밀번호유효성검사");

      setStyle(() => ({
        ...style,
        bgColorPasswordCheck: "bg-inputBoxFocus",
        shadowPasswordCheck: "drop-shadow-inputBoxShadow",
      }));
      if (passwordCheckValue.trim() === "") {
        setStyle(() => ({
          ...style,
          bgColorPasswordCheck: "bg-inputBox",
          shadowPasswordCheck: "",
        }));
      }
      passwordCheckValidationTest(userPasswordCheckCurrnet);
    }
  };

  //=======================회원가입=============================
  const onSubmit = (event) => {
    event.preventDefault();

    //ref 객체
    const userNameCurrent = userNameRef.current;
    const userEmailCurrent = userEmailRef.current;
    const userNickNameCurrent = userNickNameRef.current;
    const userPasswordCurrent = userPasswordRef.current;
    const passwordCheckCurrent = PasswordCheckRef.current;

    //ref 값
    const nameValue = userNameCurrent.value;
    const emailValue = userEmailCurrent.value;
    const nickNameValue = userNickNameCurrent.value;
    const passwordValue = userPasswordCurrent.value;
    const passwordCheckValue = passwordCheckCurrent.value;

    if (nameValue.trim() === "") {
      SetRegulation(() => ({
        ...regulation,
        regulationName: "이름을 입력해주세요.",
      }));
      userNameCurrent.focus();
      return;
    } else {
      console.log("이름유효성검사");
      nameValidationTest(userNameCurrent);
    }

    if (emailValue.trim() === "") {
      SetRegulation(() => ({
        ...regulation,
        regulationEmail: "이메일을 입력해주세요.",
      }));
      userEmailCurrent.focus();
      return;
    } else if (emailValue) {
      emailValidationTest(userEmailCurrent);
    } else if (!doubleCheck.emailDoubleCheck) {
      SetRegulation(() => ({
        ...regulation,
        regulationEmail: "이메일 중복확인 해주세요.",
      }));
      userEmailCurrent.focus();
      return;
    }

    if (nickNameValue.trim() === "") {
      SetRegulation(() => ({
        ...regulation,
        regulationNickName: "닉네임을 입력해주세요.",
      }));
      userNickNameCurrent.focus();
      return;
    } else if (nickNameValue) {
      nickNameValidationTest(userNickNameCurrent);
    } else if (!nickNameDoubleCheck) {
      SetRegulation(() => ({
        ...regulation,
        regulationNickName: "닉네임 중복확인 해주세요.",
      }));
      userNickNameCurrent.focus();
      return;
    }

    if (passwordValue.trim() === "") {
      SetRegulation(() => ({
        ...regulation,
        regulationPassword: "비밀번호를 입력해주세요.",
      }));
      userPasswordCurrent.focus();
      return;
    } else {
      passwordValidationTest(userPasswordCurrent);
    }

    console.log(passwordCheckValue);
    if (passwordCheckValue.trim() === "") {
      SetRegulation(() => ({
        ...regulation,
        regulationPassword: "비밀번호 중복확인을 입력해주세요.",
      }));
    } else {
      if (!doubleCheck.passwordDoubleCheck) {
        SetRegulation(() => ({
          ...regulation,
          regulationPassword: "비밀번호 중복확인 해주세요.",
        }));
        userPasswordCurrent.focus();
        return;
      } else {
        passwordCheckValidationTest(passwordCheckCurrent);
      }
    }

    dispatch(
      userInfoState({
        username: nameValue,
        nickname: nickNameValue,
        email: emailValue,
        password: passwordValue,
        profileImage: null,
      })
    );
    dispatch(setSingup("emailLogin"));
  };

  useEffect(() => {
    if (singup === "emailLogin") {
      console.log(singup);
      navigate("/signup/setProfileImg");
    }
  }, [dispatch, navigate, singup]);

  return (
    <>
      <div className="container">
        <div className=" grid grid-flow-row ml-[20px] mr-[20px] gap-[32px]">
          <div className=" grid grid-flow-row gap-[10px] mt-[106px]">
            <div>
              <h1 className="font-[700] text-textBlack text-[32px] mb-[10px]">
                Welcome Gnims!
              </h1>
            </div>
            <div className="font-[500] text-textBlack text-[24px] ">
              <p className="mb-[15px]">일정관리, 공유의 샛별</p>
              <p>그님스는 여러분을 환영해요!</p>
            </div>
          </div>
          <form className="">
            <div className="grid gird-rows-5 gap-[20px]">
              <div>
                <Label htmlFor="userName">이름</Label>
                <LoginSignupInputBox
                  type="text"
                  id="userName"
                  ref={userNameRef}
                  onChange={onValidity}
                  placeholder="사용자의 이름을 입력해주세요."
                  bgColor={style.bgColorName}
                  shadow={style.shadowName}
                />
                <div
                  className="flex items-center"
                  hidden={hidden.hiddenErrorMeassaName}
                >
                  <p className="h-[40px] w-full font-[500] text-[16px]  text-[#DE0D0D] flex items-center">
                    {regulation.regulationName}
                  </p>
                </div>
              </div>
              <div className="relative">
                <Label htmlFor="userEmail">이메일</Label>
                <div>
                  <input
                    type="email"
                    id="userEmail"
                    ref={userEmailRef}
                    placeholder="아이디로 사용할 이메일을 입력해주세요."
                    onChange={onValidity}
                    className={`${style.bgColorEmail} ${style.shadowEmail} w-full px-1 h-[50px] text-[16px]  placeholder-inputPlaceHoldText`}
                    autoComplete="off"
                  ></input>
                  <button
                    className="absolute right-[5px] mt-[18px] font-[600] text-textBlack text-[16px]"
                    onClick={onEmailDoubleCheck}
                  >
                    중복 확인
                  </button>
                </div>
                <div hidden={hidden.hiddenErrorMeassaEmail}>
                  <p className=" w-full font-[500] mt-[20px] text-[16px] text-[#DE0D0D] flex items-center">
                    {regulation.regulationEmail}
                  </p>
                </div>
              </div>
              <div className="relative">
                <Label htmlFor="userNickName">닉네임</Label>
                <div>
                  <input
                    id="userNickName"
                    ref={userNickNameRef}
                    placeholder="2~8자리 숫자,한글,영문을 입력해주세요."
                    onChange={onValidity}
                    className={`${style.bgColorNickname} ${style.shadowNickname} w-full px-1 h-[50px] text-[16px]  placeholder-inputPlaceHoldText`}
                    autoComplete="off"
                  ></input>
                  <button
                    className="absolute right-[5px] mt-[18px] font-[600] text-textBlack text-[16px]"
                    onClick={onNickNameCheck}
                  >
                    중복 확인
                  </button>
                </div>
                <div hidden={hidden.hiddenErrorMeassaNickName}>
                  <p className=" w-full font-[500] mt-[20px] text-[16px] text-[#DE0D0D] flex items-center">
                    {regulation.regulationNickName}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="userPassword">비밀번호</Label>
                <div>
                  <LoginSignupInputBox
                    type="password"
                    id="userPassword"
                    ref={userPasswordRef}
                    placeholder="8~16자리 영문 대소문자, 숫자 조합"
                    onChange={onValidity}
                    bgColor={style.bgColorPassword}
                    shadow={style.shadowPassword}
                  />
                </div>
                <div
                  hidden={hidden.hiddenErrorMeassaPassword}
                  className="mt-[10px]"
                >
                  <p className="w-full font-[500] text-[16px] text-[#DE0D0D] flex items-center">
                    {regulation.regulationPassword}
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="passwordCheck">비밀번호 확인</Label>
                <div>
                  <LoginSignupInputBox
                    type="password"
                    id="passwordCheck"
                    placeholder="8~16자리 영문 대소문자, 숫자 조합"
                    onChange={onValidity}
                    ref={PasswordCheckRef}
                    bgColor={style.bgColorPasswordCheck}
                    shadow={style.shadowPasswordCheck}
                  />
                </div>
                <div
                  hidden={hidden.hiddenErrorMeassaPasswordCheck}
                  className="mt-[10px]"
                >
                  <p className="w-full font-[500] text-[16px] text-[#DE0D0D] flex items-center">
                    {regulation.regulationPasswordCheck}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <button
                onClick={onSubmit}
                className="h-[50px] rounded w-full bg-[#002C51] font-[700] text-[#ffff] mt-[24px] mb-[69px]"
              >
                회원가입 완료
              </button>
            </div>
          </form>
          <IsModal
            isModalOpen={isOpen.isOpen}
            onMoalClose={onMoalClose}
            message={{ ModalStr }}
          />
        </div>
      </div>
    </>
  );
};

export default Signup;
