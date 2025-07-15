import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import HomePage from './components/HomePage';
import Header from './components/Header';

// Import all topic pages
import BasicsPage from './pages/BasicsPage';
import SortingPage from './pages/SortingPage';
import ArraysPage from './pages/ArraysPage';
import BinarySearchPage from './pages/BinarySearchPage';
import StringsPage from './pages/StringsPage';
import LinkedListsPage from './pages/LinkedListsPage';
import RecursionPage from './pages/RecursionPage';
import BacktrackingPage from './pages/BacktrackingPage';
import BitManipulationPage from './pages/BitManipulationPage';
import StacksQueuesPage from './pages/StacksQueuesPage';
import SlidingWindowsTwoPointersPage from './pages/SlidingWindowsTwoPointersPage';
import HeapsPage from './pages/HeapsPage';
import GreedyPage from './pages/GreedyPage';
import TreesPage from './pages/TreesPage';
import GraphsPage from './pages/GraphsPage';
import DynamicProgrammingPage from './pages/DynamicProgrammingPage';
import TriesPage from './pages/TriesPage';
import SegmentTreesPage from './pages/SegmentTreesPage';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen transition-colors duration-300">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/topic/basics" element={<BasicsPage />} />
          <Route path="/topic/sorting" element={<SortingPage />} />
          <Route path="/topic/arrays" element={<ArraysPage />} />
          <Route path="/topic/binary-search" element={<BinarySearchPage />} />
          <Route path="/topic/strings" element={<StringsPage />} />
          <Route path="/topic/linked-lists" element={<LinkedListsPage />} />
          <Route path="/topic/recursion" element={<RecursionPage />} />
          <Route path="/topic/backtracking" element={<BacktrackingPage />} />
          <Route path="/topic/bit-manipulation" element={<BitManipulationPage />} />
          <Route path="/topic/stacks-queues" element={<StacksQueuesPage />} />
          <Route path="/topic/sliding-windows-two-pointers" element={<SlidingWindowsTwoPointersPage />} />
          <Route path="/topic/heaps" element={<HeapsPage />} />
          <Route path="/topic/greedy" element={<GreedyPage />} />
          <Route path="/topic/trees" element={<TreesPage />} />
          <Route path="/topic/graphs" element={<GraphsPage />} />
          <Route path="/topic/dynamic-programming" element={<DynamicProgrammingPage />} />
          <Route path="/topic/tries" element={<TriesPage />} />
          <Route path="/topic/segment-trees" element={<SegmentTreesPage />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;