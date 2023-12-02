import '../styles/globals.css'
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import Header from '../components/Header';
import { ApolloProvider } from '@apollo/client';
import createApolloClient from "../apollo-client"
import { Toaster } from 'react-hot-toast';

interface MyAppProps extends AppProps {
  pageProps: {
    session: any; // Replace 'any' with the actual type of your session object
  };
}
const client = createApolloClient();
function MyApp({ Component, pageProps: { session, ...restPageProps } }: MyAppProps) {
  return (
    <ApolloProvider client={client}>

    <SessionProvider session={session}>
      <Toaster />
      <div className='h-screen overflow-y-scroll bg-slate-200'>
        <Header />
        <Component {...restPageProps} />
      </div>
    </SessionProvider>
    </ApolloProvider>
  );
}

export default MyApp;
