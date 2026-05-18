import { useDispatch, useSelector } from 'react-redux';
import MangaDexApi from '../Services/MangaDexApi';
import { setUser } from '../Store/Slices/userSlice';

const useAddToList = (mangaId) => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.user.user);

    const fetchMangaToList = async (list) => {
        try {
            const resp = await fetch(`${MangaDexApi.CorsProxy}https://api.mangadex.org/manga/${mangaId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.sessionToken}`
                },
                body: JSON.stringify({
                    status: list.value
                })
            }).then(data => data.json());
            return resp;
        } catch (error) {
            console.error("Failed to update manga status in list:", error);
        }
    }

    const refreshSession = async (list) => {
        try {
            const resp = await fetch(`${MangaDexApi.CorsProxy}https://api.mangadex.org/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: user.refreshToken
                })
            }).then(data => data.json());

            if (resp.result === 'ok') {
                const expires = new Date().valueOf() + 15 * 60000;

                const refreshedUser = {
                    username: user.username,
                    expires,
                    sessionToken: resp.token.session,
                    refreshToken: resp.token.refresh
                }

                dispatch(setUser(refreshedUser));
                await fetchMangaToList(list);
            }
        } catch (error) {
            console.error("Session refresh in addToList failed:", error);
        }
    }

    return (list) => {
        if (user.username && user.expires > new Date().valueOf()) {
            fetchMangaToList(list);
        } else {
            refreshSession(list);
        }
    }
};

export default useAddToList;