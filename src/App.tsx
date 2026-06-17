import { useState, useEffect, useCallback } from 'react';
import {
  loadCredentialsFromStorage,
  clearCredentials,
  fetchCollection,
  getCredentials,
} from './lib/dataspace';
import CredentialsForm from './components/CredentialsForm';
import StatsBar from './components/StatsBar';
import WorkOrderTable from './components/WorkOrderTable';
import WorkOrderDetail from './components/WorkOrderDetail';

type WorkOrder = Record<string, unknown>;

type AppState = 'credentials' | 'loading' | 'ready' | 'error';

// Known collection names for work orders — tried in order
const COLLECTIONS = ['jobDetails', 'workOrders', 'workorders', 'jobs', 'machineOperations'];

export default function App() {
  const [appState, setAppState] = useState<AppState>('credentials');
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [selected, setSelected] = useState<WorkOrder | null>(null);
  const [error, setError] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [authError, setAuthError] = useState('');

  const loadData = useCallback(async () => {
    setAppState('loading');
    setError('');

    for (const col of COLLECTIONS) {
      try {
        const data = await fetchCollection<WorkOrder>(col);
        if (Array.isArray(data)) {
          setOrders(data);
          setCollectionName(col);
          setAppState('ready');
          return;
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '';
        if (msg === 'AUTH_FAILED') {
          clearCredentials();
          setAuthError('Authentication failed — please check your credentials.');
          setAppState('credentials');
          return;
        }
        // Try next collection
        continue;
      }
    }

    // None found — show empty state with first collection attempted
    setOrders([]);
    setCollectionName(COLLECTIONS[0]);
    setAppState('ready');
  }, []);

  // On mount, try loading saved creds
  useEffect(() => {
    const loaded = loadCredentialsFromStorage();
    if (loaded) {
      loadData();
    } else {
      setAppState('credentials');
    }
  }, [loadData]);

  const handleConnected = () => {
    loadData();
  };

  const handleDisconnect = () => {
    clearCredentials();
    setOrders([]);
    setSelected(null);
    setAuthError('');
    setAppState('credentials');
  };

  const creds = getCredentials();

  if (appState === 'credentials') {
    return <CredentialsForm onConnected={handleConnected} error={authError} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Work Orders</h1>
              {appState === 'ready' && collectionName && (
                <p className="text-xs text-gray-400">
                  {creds?.plant_code} · {creds?.company_code} · <span className="font-mono">{collectionName}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {appState === 'ready' && (
              <button
                onClick={loadData}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            )}
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Disconnect
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {appState === 'loading' && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <svg className="animate-spin w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-gray-500 text-sm">Fetching work orders from DataSpace…</p>
          </div>
        )}

        {appState === 'error' && (
          <div className="max-w-md mx-auto mt-12 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <svg className="w-8 h-8 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-700 font-medium mb-1">Failed to load data</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {appState === 'ready' && (
          <>
            <StatsBar orders={orders} />

            {orders.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-gray-900 font-semibold mb-1">No Work Orders Found</h3>
                <p className="text-gray-500 text-sm">
                  No records were found in your DataSpace collections.<br />
                  Try adjusting your filters or check that your plant code is correct.
                </p>
                <button
                  onClick={loadData}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            ) : (
              <WorkOrderTable
                orders={orders}
                onSelect={setSelected}
                selected={selected}
              />
            )}
          </>
        )}
      </main>

      {/* Detail panel */}
      {selected && (
        <WorkOrderDetail order={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
