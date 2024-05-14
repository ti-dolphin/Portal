import { Stack, Box, CircularProgress, Typography } from '@mui/material'
import FeedPost from './FeedPost';
import InfiniteScroll from "react-infinite-scroller";
import { useSelector } from 'src/redux/store'

type Props = {
    redeSocialHook: any;
}

export default function Feed({redeSocialHook}: Props){
    const { postsFeed } = useSelector((state: any) => state.post)

    return(
        <>
            <InfiniteScroll
                pageStart={1}
                loadMore={redeSocialHook.handleGetMorePostsFeed}
                hasMore={postsFeed.next}
            >
                <Stack spacing={2}>
                    {postsFeed.posts.length > 0 ? 
                        postsFeed.posts.map((post:any) =>
                            <FeedPost key={'PostFeed_'+post.id} redeSocialHook={redeSocialHook} post={post}/>
                        )
                        :
                        <Box mt={2} display='flex' alignItems="flex-start" justifyContent='center' sx={{minHeight: '540px'}}>
                            {redeSocialHook.filter ?
                                <Typography variant="h4">Nenhum post encontrado.</Typography>
                            :
                                <CircularProgress/>
                            }
                        </Box>
                    }
                </Stack>
            </InfiniteScroll>
        </>
    )
}