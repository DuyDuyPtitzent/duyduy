import axios from 'axios'; //thư viện axios dùng để gọi api

export const getData = async () => {
	const res = await axios.get('https://randomapi.com/api/6de6abfedb24f889e0b5f675edc50deb?fmt=raw&sole');// gọi api randomuser.me
	return res;
};
