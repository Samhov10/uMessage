import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api.js";

const useAuthUser = () => {
  const {
    data: authUser,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    isLoading,
    authUser,
    error,
  };
};

export default useAuthUser;