import axiosClient from ".";

interface GetContactsParams {
  page?: number;
  limit?: number;
  q?: string;
}

export const getContacts = async ({
  page = 1,
  limit = 10,
  q = "",
}: GetContactsParams = {}) => {
  return await axiosClient.get("/user/list-users", {
    params: {
      page,
      limit,
      q,
    },
  });
};
