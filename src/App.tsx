import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import logo from './logo.svg'; // Import the static image

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;

  & select {
    padding: 5px;
  }
`;

const StoryContainer = styled.div`
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px 0;
  display: flex;
  align-items: center;

  & a {
    color: #068932;
    font-size: .8em;
  }
`;

const LogoImage = styled.img`
  width: 30px;
  height: 30px;
  margin-right: 10px;
`;

const Title = styled.h2`
  font-size: 1.5rem;
`;

const StoryInfo = styled.p`
  font-size: 0.8rem;
  color: #777;
`;

const SearchBar = styled.input`
  margin-bottom: 10px;
  padding: 5px;
  margin-right: 3rem;
`;

const App: React.FC = () => {
  const [stories, setStories] = useState<any[]>([]);
  const [sortedStories, setSortedStories] = useState<any[]>([]);
  const [sortOption, setSortOption] = useState<string>('score');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  useEffect(() => {
    const filteredStories = stories.filter(story =>
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.by.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedAndFiltered = [...filteredStories].sort((a, b) => {
      if (sortOption === 'score') {
        return b.score - a.score;
      } else if (sortOption === 'time') {
        return b.time - a.time;
      }
      return 0;
    });

    setSortedStories(sortedAndFiltered);
  }, [stories, searchTerm, sortOption]);

  useEffect(() => {
    fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
      .then(response => response.json())
      .then(async (storyIds: number[]) => {
        // Shuffle the story IDs randomly
        const shuffledStoryIds = storyIds.sort(() => Math.random() - 0.5);
        
        const selectedStoryIds = shuffledStoryIds.slice(0, 10); // Select the first 10 shuffled story IDs
        
        const storyPromises = selectedStoryIds.map(id =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
            .then(response => response.json())
        );
        const fetchedStories = await Promise.all(storyPromises);

        const sortedStories = fetchedStories.sort((a, b) => b.score - a.score); // Sort by score
        
        const storyWithUserPromises = sortedStories.map(story =>
          fetch(`https://hacker-news.firebaseio.com/v0/user/${story.by}.json`)
            .then(response => response.json())
            .then(user => ({ ...story, karma: user.karma }))
        );

        const storiesWithUser = await Promise.all(storyWithUserPromises);
        setStories(storiesWithUser);
      });
  }, []);

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  return (
    <Container>
      <h1>Hacker News Top Stories</h1>
      <SearchBar
        placeholder="Search by title or username"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <select
        value={sortOption}
        onChange={e => setSortOption(e.target.value)}
      >
        <option value="score">Sort by Score</option>
        <option value="time">Sort by Time</option>
      </select>
      {sortedStories.map(story => (
        <StoryContainer key={story.id}>
          <LogoImage src={logo} alt="React Logo" />
          <div>
            <Title>{story.title}</Title>
            <StoryInfo>
              Score: {story.score} | By: {story.by} | Karma: {story.karma}
            </StoryInfo>
            <p>Time: {formatTimestamp(story.time)}</p>
            <a href={story.url} target="_blank" rel="noopener noreferrer">
              Read More
            </a>
          </div>
        </StoryContainer>
      ))}
    </Container>
  );
};

export default App;
