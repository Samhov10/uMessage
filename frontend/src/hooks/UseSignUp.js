import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

import { signup } from "../lib/api.js";

const UseSignUp = () => {
  const navigate = useNavigate();

  const {
    mutate: signupMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: signup,

    onSuccess: (data) => {
      console.log("SIGNUP SUCCESS:", data);

      toast.success(
        "Код подтверждения отправлен на вашу почту"
      );

      console.log(
    "ПЕРЕХОЖУ НА:",
      `/verify-email?email=${encodeURIComponent(data.email)}`
      );

      navigate(
        `/verify-email?email=${encodeURIComponent(data.email)}`,
        {
          replace: true,
        }
      );
    },

    onError: (error) => {
      console.error(
        "SIGNUP ERROR:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "Ошибка регистрации"
      );
    },
  });

  return {
    signupMutation,
    isPending,
    error,
  };
};




export default UseSignUp;