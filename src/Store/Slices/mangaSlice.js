import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import MangaDexApi from "../../Services/MangaDexApi";
import { collectData } from "../../Utils/layoutData";

export const fetchMangaInfo = createAsyncThunk(
    'manga/fetchMangaInfo',
    async function({ mangaId }, {rejectWithValue, dispatch}) {
        try {
            const response = await MangaDexApi.getMangaInfo(mangaId);
            if (!response.ok) {
                throw new Error('Something is going wrong...');
            }
            const data = await response.json();
            dispatch(setMangaInfo(data.data));
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const fetchMangaStatistics = createAsyncThunk(
    'manga/fetchMangaStatistics',
    async function({ mangaId }, {rejectWithValue, dispatch}) {
        try {
            const response = await MangaDexApi.getMangaStatistics(mangaId);
            if (!response.ok) {
                throw new Error('Something is going wrong...');
            }
            const data = await response.json();
            dispatch(setStatistics(data['statistics']));
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const fetchMangaCovers = createAsyncThunk(
    'manga/fetchMangaCovers',
    async function({ mangaId, offset = 0 }, {rejectWithValue, dispatch}) {
        try {
            const response = await MangaDexApi.getMangaCoversByVolumes(mangaId, offset);
            dispatch(setCovers(response));
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const fetchMangaFeed = createAsyncThunk(
    'manga/fetchMangaAuthor',
    async function({ mangaId, offset = 0 }, {rejectWithValue, dispatch}) {
        try {
            const response = await MangaDexApi.getMangaFeed(mangaId, offset);
            if (!response.ok) {
                throw new Error('Something is going wrong...');
            }
            const data = await response.json();
            dispatch(setFeed({total: data.total, array: collectData(data.data, 'volume')}));
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

const initialState = {
    mangaInfo: {
        load: {
            status: 'loading',
            error: null
        },
        data: null
    },
    statistics: {
        load: {
            status: 'loading',
            error: null
        },
        data: null
    },
    feed: {
        load: {
            status: 'loading',
            error: null
        },
        data: null
    },
    covers: {
        load: {
            status: 'loading',
            error: null
        },
        data: null
    }
}

const setLoading = (state, action, selector) => {
    state[selector].load.status = 'loading';
    state[selector].load.error = null;
}

const setResolved = (state, action, selector) => {
    state[selector].load.status = 'resolved';
    state[selector].load.error = null;
}

const setError = (state, action, selector) => {
    state[selector].load.status = 'rejecred';
    state[selector].load.error = action.payload;
}

const mangaSlice = createSlice({
    name: 'manga',
    initialState,
    reducers: {
        setMangaInfo(state, action) {
            state.mangaInfo.data = action.payload;
        },
        setStatistics(state, action) {
            state.statistics.data = action.payload;
        },
        setCovers(state, action) {
            state.covers.data = action.payload;
        },
        setFeed(state, action) {
            state.feed.data = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMangaInfo.pending, (state, action) => setLoading(state, action, 'mangaInfo'))
            .addCase(fetchMangaInfo.fulfilled, (state, action) => setResolved(state, action, 'mangaInfo'))
            .addCase(fetchMangaInfo.rejected, (state, action) => setError(state, action, 'mangaInfo'))

            .addCase(fetchMangaStatistics.pending, (state, action) => setLoading(state, action, 'statistics'))
            .addCase(fetchMangaStatistics.fulfilled, (state, action) => setResolved(state, action, 'statistics'))
            .addCase(fetchMangaStatistics.rejected, (state, action) => setError(state, action, 'statistics'))

            .addCase(fetchMangaCovers.pending, (state, action) => setLoading(state, action, 'covers'))
            .addCase(fetchMangaCovers.fulfilled, (state, action) => setResolved(state, action, 'covers'))
            .addCase(fetchMangaCovers.rejected, (state, action) => setError(state, action, 'covers'))

            .addCase(fetchMangaFeed.pending, (state, action) => setLoading(state, action, 'feed'))
            .addCase(fetchMangaFeed.fulfilled, (state, action) => setResolved(state, action, 'feed'))
            .addCase(fetchMangaFeed.rejected, (state, action) => setError(state, action, 'feed'));
    }
})

export const { setMangaInfo, setAuthor, setStatistics, setCovers, setFeed } = mangaSlice.actions

export default mangaSlice.reducer;