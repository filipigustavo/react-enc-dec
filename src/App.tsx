import { useState } from 'react'

import FormHash from './FormHash'
import NavTabs from './NavTabs'
import LocalstorageContent from './LocalstorageContent'
import NewGenerator from './NewGenerator'
import FormDescription from './FormDescription'

function App() {
  const [activeTab, setActiveTab] = useState<string>('default')

  const handleSetActiveTab = (tab: string) => (ev: React.MouseEvent<HTMLAnchorElement>) => {
    ev.preventDefault()
    setActiveTab(tab)
  }

  return (
    <div className="App container py-5">
      <div className="row">
        <div className="col">
          <h1>React Enc-dec</h1>
          <p>A simple library to hide values in localStorage easily.</p>
          <p>
            See documentation{' '}
            <a
              href="https://www.npmjs.com/package/@filipigustavo/react-enc-dec"
              target="_blank"
              rel="noreferrer"
            >
              here
            </a>
          </p>
        </div>
      </div>

      <hr />

      <div className="row">
        <div className="col-12 col-lg-6">
          <NavTabs value={activeTab} onChange={handleSetActiveTab} />

          {activeTab === 'default' && (
            <FormHash
              title="Default"
              description={
                <FormDescription description="const { index, enc, dec, remove, renew, clear } = useHash()" />
              }
            />
          )}

          {activeTab === 'prefixed' && (
            <FormHash
              title="Prefixed"
              description={
                <FormDescription
                  description="const { index, enc, dec, remove, renew, clear } = useHash({ prefix: 'teste-prefix' })"
                />
              }
              hashConfig={{ prefix: 'teste-prefix' }}
            />
          )}

          {activeTab === 'advanced' && (
            <FormHash
              title="Advanced"
              description={
                <>
                  <FormDescription
                    description="const { index, enc, dec, remove, renew, clear } = useHash({ globalPrefix: 'advanced', prefix: 'hashed', Generator: NewGenerator, onError: (err, ctx) => console.error(ctx, err) })"
                  />
                  <FormDescription description="NewGenerator class is a custom way to do your own hash!" />
                </>
              }
              hashConfig={{
                globalPrefix: 'advanced',
                prefix: 'hashed',
                Generator: NewGenerator,
                onError: (err, ctx) => console.error(ctx, err),
              }}
            />
          )}
        </div>

        <div className="col-12 col-lg-6">
          <LocalstorageContent />
        </div>
      </div>
    </div>
  )
}

export default App
