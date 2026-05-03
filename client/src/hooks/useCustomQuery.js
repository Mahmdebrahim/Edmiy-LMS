import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../config/axios.config";

const useCustomQuery = ({ queryKey, URL, config, options = {} }) =>
  useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await axiosInstance.get(URL, config);
      return data;
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useCustomMutation = ({
  URL,
  method = "post",
  invalidateKeys,
  onSuccess,
  onError,
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const { _url, ...rest } = data;
      const url = _url || URL;
      const { data: res } = await axiosInstance[method](url, rest);
      return res;
    },
    onSuccess: (data, variables) => {
      if (invalidateKeys) {
        invalidateKeys.forEach((key) =>
          queryClient.invalidateQueries({ queryKey: [key] }),
        );
      }
      onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      onError?.(error, variables);
    },
  });
};

export default useCustomQuery;
