import React, { useState, useEffect, useRef, createContext } from 'react';
import PropTypes from 'prop-types';

import { getPostsBySubreddit } from '../services/redditAPI';

const Context = createContext();
const { Provider, Consumer } = Context;

function RedditProvider({children}) {

  const [postsBySubreddit, setpostsBySubreddit] = useState({
    frontend: {},
    reactjs: {},
  })
  const [selectedSubreddit, setselectedSubreddit] = useState('reactjs');
  const [shouldRefreshSubreddit, setshouldRefreshSubreddit] = useState(false);
  const [isFetching, setisFetching]= useState(false);

  //  componentDidUpdate(_prevProps, prevState) {
  //    const { state } = this;
  //    const { shouldRefreshSubreddit } = state;
  //    const selectedSubredditChanged = prevState.selectedSubreddit !== state.selectedSubreddit;
  
  //    if (selectedSubredditChanged || shouldRefreshSubreddit) {
  //      this.fetchPosts();
  //    }
  //  }

  const selectedSubredditChanged = usePrevious(selectedSubreddit)!== selectedSubreddit;

  useEffect(() => { // componentDidUpdate
    if (selectedSubredditChanged || shouldRefreshSubreddit) {
      fetchPosts();
    }
  });

  function usePrevious(value) {  // Custom Hook para pegar valores anteriores
    const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
  }
     
  const fetchPosts = () => {
    if (!shouldFetchPosts()) return;

    // this.setState({
    //   shouldRefreshSubreddit: false,
    //   isFetching: true,
    // });

      setshouldRefreshSubreddit(false);
      setisFetching(true);
    
    // const { selectedSubreddit } = this.state;
    getPostsBySubreddit(selectedSubreddit)
      .then(handleFetchSuccess, handleFetchError);
  }

  const shouldFetchPosts = () => {
    // const {
    //   selectedSubreddit,
    //   postsBySubreddit,
    //   shouldRefreshSubreddit,
    //   isFetching,
    // } = this.state;

    const posts = postsBySubreddit[selectedSubreddit];

    if (!posts.items) return true;
    if (isFetching) return false;
    return shouldRefreshSubreddit;
  }

  const handleFetchSuccess = (json) => {
    const lastUpdated = Date.now();
    const items = json.data.children.map((child) => child.data);

    // this.setState((state) => {
    //   const newState = {
    //     ...state,
    //     shouldRefreshSubreddit: false,
    //     isFetching: false,
    //   };

    setshouldRefreshSubreddit(false);
    setisFetching(false);

    setpostsBySubreddit({
      ...postsBySubreddit,
      [selectedSubreddit]: {
        items,
        lastUpdated,
      }
    });
  }

  const handleFetchError = (error) => {
  
    setshouldRefreshSubreddit(false);
    setisFetching(false);
    
    setpostsBySubreddit({
      ...postsBySubreddit,
      [selectedSubreddit]: {
        error: error.message,
        items: [],
      }
    });
  }

  const handleSubredditChange = (selectedSubreddit) => {
    // this.setState({ selectedSubreddit });
    setselectedSubreddit(selectedSubreddit);
  }

  const handleRefreshSubreddit = () => {
    // this.setState({ shouldRefreshSubreddit: true });
    setshouldRefreshSubreddit(true);
  }

    // const { selectedSubreddit, postsBySubreddit } = this.state;
  const context = {
    postsBySubreddit,
    selectedSubreddit,
    shouldRefreshSubreddit,
    isFetching,
    selectSubreddit: handleSubredditChange,
    fetchPosts: fetchPosts,
    refreshSubreddit: handleRefreshSubreddit,
    availableSubreddits: Object.keys(postsBySubreddit),
    posts: postsBySubreddit[selectedSubreddit].items,
  };

  return (
    <Provider value={context}>
      {children}
    </Provider>
  );
}

RedditProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { RedditProvider as Provider, Consumer, Context };