import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OverviewPage from './OverviewPage';
import { OverviewProvider } from './context/OverviewProvider';

// Buat QueryClient
const queryClient = new QueryClient();

const OverviewFeature = (): React.ReactElement =>
    React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(
            OverviewProvider,
            null,
            React.createElement(OverviewPage, null)
        )
    );

export default OverviewFeature;