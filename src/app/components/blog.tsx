'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Modal from './Modal';
import rehypeRaw from 'rehype-raw';
import { Post } from './posts';
import Navbar from './Navbar';
import Footer from './footer';
import Image from 'next/image';

interface BlogListProps {
  posts: Post[];
}

const BlogList: React.FC<BlogListProps> = ({ posts }) => {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  if (!posts.length) {
    return <div>No posts found. Please check your _posts folder.</div>;
  }
  
  const openModal = (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPost(null);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar scrollSet={false} opacitySet={false} />
      <div className="flex-grow">
        <div className="text-black px-5 py-5 max-w-screen-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mt-6 md:mt-10 mb-6 md:mb-10">
            Blog Posts
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full">
            {posts.map((post, index) => (
              <div
                key={post.slug}
                onClick={() => openModal(post)}
                className="border border-gray-200 rounded-lg p-4 md:p-6 cursor-pointer 
                         bg-[#e6e4d8] hover:bg-[#d4d2c6] transition-colors duration-200 inline-flex"
              >
                <div className="flex-col flex">
                  <div className="text-sm md:text-base text-gray-600 mb-3">
                    {post.date}
                  </div>
                  <div className="text-lg md:text-xl font-bold pr-2">
                    {post.title}
                  </div>
                </div>
                {post.image && (
                  <Image
                    src={post.image}
                    alt={post.title}
                    className="w-[40%] ml-auto object-cover rounded"
                    priority={index < 6}
                    loading={index < 6 ? "eager" : "lazy"}
                    sizes="(max-width: 768px) 40vw, (max-width: 1024px) 25vw, 200px"
                    width={200}
                    height={200}
                  />
                )}
              </div>
            ))}
          </div>
          
          <Modal open={isModalOpen} onClose={closeModal}>
            {selectedPost && (
              <div className="max-w-screen-md mx-auto p-4 md:p-6 overflow-y-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  {selectedPost.title}
                </h2>
                <p className="text-gray-600 text-sm md:text-base mb-4">
                  {selectedPost.date}
                </p>
                <div className="prose max-w-none">
                  <ReactMarkdown 
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      img: (props) => (
                        <Image
                          src={props.src || ''}
                          alt={props.alt || ''}
                          className="rounded-lg max-w-full h-auto"
                          width={600}
                          height={400}
                          loading="lazy"
                        />
                      ),
                    }}
                  >
                    {selectedPost.content}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogList;