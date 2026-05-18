import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import MangaDexApi from "../../Services/MangaDexApi";
import { getMangasIds } from "../../Utils/getMangaIds";

export const fetchSeasonal = createAsyncThunk(
    'suggest/fetchSeasonal',
    async function(_, {rejectWithValue, dispatch}) {
        try {
            const seasonalList = await MangaDexApi.getSeasonal();

            if (!seasonalList.ok) {
                throw new Error('Something is going wrong...');
            }
            
            const data = await seasonalList.json();

            const seasonalIds = getMangasIds(data.data.relationships);

            const seasonalInfo = await MangaDexApi.getSeasonalInfo(seasonalIds);

            if (!seasonalInfo.ok) {
                throw new Error('Something is going wrong...');
            }

            const seasonalData = await seasonalInfo.json();

            dispatch(setSeasonal(seasonalData.data));
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const fetchLatestUpdates = createAsyncThunk(
    'suggest/fetchLatestUpdates',
    async function(_, {rejectWithValue, dispatch}) {
        try {
            const latestUpdatesList = await MangaDexApi.getLatestUpdateChapters();

            if (!latestUpdatesList.ok) {
                throw new Error('Something is going wrong...');
            }

            const latestUpdListData = await latestUpdatesList.json();

            const latestUpdatesIds = getMangasIds(latestUpdListData?.data.reduce((accu, curr) => {
                accu.push(...curr?.relationships.filter(el => el.type === 'manga'))
                return accu;
            }, []));

            const latestUpdatesMangas = await MangaDexApi.getLatestUpdateMangas(latestUpdatesIds);

            if (!latestUpdatesMangas.ok) {
                throw new Error('Something is going wrong...');
            }

            const latestUpdMangasData = await latestUpdatesMangas.json();

            latestUpdListData.data = latestUpdListData.data.map((chapter) => {
                const mangaRel = chapter.relationships.find(el => el.type === 'manga');
                if (mangaRel) {
                    const mangaObj = latestUpdMangasData.data.find(m => m.id === mangaRel.id);
                    if (mangaObj) {
                        // Replace minimal manga relationship with full manga object
                        chapter.relationships = chapter.relationships.map(rel => {
                            if (rel.type === 'manga') {
                                return mangaObj;
                            }
                            return rel;
                        });

                        // Inject cover_art relationship
                        const coverArt = mangaObj.relationships?.find(el => el.type === 'cover_art');
                        if (coverArt) {
                            chapter.relationships.push(coverArt);
                        }
                    }
                }
                return chapter;
            });

            dispatch(setLatestUpdates({data: latestUpdListData.data.slice(0, 18)}));
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const fetchRecentlyAdded = createAsyncThunk(
    'suggest/fetchRecentlyAdded',
    async function(_, {rejectWithValue, dispatch}) {
        try {
            const recentlyAdded = await MangaDexApi.getRecentlyAdded();

            if (!recentlyAdded.ok) {
                throw new Error('Something is going wrong...');
            }

            const recentlyAddedData = await recentlyAdded.json();
            
            dispatch(setRecentlyAdded(recentlyAddedData.data));
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

const initialState = {
    seasonal: {
        load: {
            status: 'loading',
            error: null
        },
        data: null
    },
    latestUpdates: {
        load: {
            status: 'loading',
            error: null
        },
        data: null
    },
    recentlyAdded: {
        load: {
            status: 'loading',
            error: null
        },
        data: null
    }
}

// TODO: take to the slice util

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

const suggestSlice = createSlice({
    name: 'suggest',
    initialState,
    reducers: {
        setSeasonal(state, action) {
            state.seasonal.data = action.payload;
        },
        setLatestUpdates(state, action) {
            state.latestUpdates.data = action.payload;
        },
        setRecentlyAdded(state, action) {
            state.recentlyAdded.data = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSeasonal.pending, (state, action) => setLoading(state, action, 'seasonal'))
            .addCase(fetchSeasonal.fulfilled, (state, action) => setResolved(state, action, 'seasonal'))
            .addCase(fetchSeasonal.rejected, (state, action) => setError(state, action, 'seasonal'))

            .addCase(fetchLatestUpdates.pending, (state, action) => setLoading(state, action, 'latestUpdates'))
            .addCase(fetchLatestUpdates.fulfilled, (state, action) => setResolved(state, action, 'latestUpdates'))
            .addCase(fetchLatestUpdates.rejected, (state, action) => setError(state, action, 'latestUpdates'))

            .addCase(fetchRecentlyAdded.pending, (state, action) => setLoading(state, action, 'recentlyAdded'))
            .addCase(fetchRecentlyAdded.fulfilled, (state, action) => setResolved(state, action, 'recentlyAdded'))
            .addCase(fetchRecentlyAdded.rejected, (state, action) => setError(state, action, 'recentlyAdded'));
    }
})

export const { setSeasonal, setLatestUpdates, setRecentlyAdded } = suggestSlice.actions;

export default suggestSlice.reducer;