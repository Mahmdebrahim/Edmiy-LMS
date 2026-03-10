// hooks/useCustomQuery.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../config/axios.config";

const useCustomQuery = ({ queryKey, URL, config, options = {} }) =>
  useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await axiosInstance.get(URL, config);
      return data;
    },
    retry: 2,
    retryDelay: 1000,
    ...options,
  });

export const useCustomMutation = ({
  URL,
  invalidateKeys,
  onSuccess,
  onError,
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const { data: res } = await axiosInstance.post(URL, data);
      return res;
    },
    onSuccess: (data, variables) => {
      // invalidate queries
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
