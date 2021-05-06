/**
 * Copyright 2021 Inrupt Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { useState, useEffect, useRef } from "react";
import { useSession } from "@inrupt/solid-ui-react";
import { getSolidDataset, getThing, getIri } from "@inrupt/solid-client";
import { WebsocketNotification } from "@inrupt/solid-client-notifications";

const gateway = "https://notification.pod.inrupt.com/";

async function getPodRoot(webId, fetchFn) {
  const dataset = await getSolidDataset(webId, { fetch: fetchFn });
  const profile = getThing(dataset, webId);
  return getIri(profile, "http://www.w3.org/ns/pim/space#storage");
}

function formatMessage(message) {
  return JSON.stringify(JSON.parse(message), null, 2);
}

export default function Home() {
  const { session } = useSession();
  const [messages, setMessages] = useState([]);
  const [podRoot, setPodRoot] = useState(null);

  const websocket = useRef(null);

  useEffect(() => {
    if (!session.info.isLoggedIn || !podRoot) {
      return;
    }

    websocket.current = new WebsocketNotification(podRoot, {
      fetch: session.fetch,
      gateway,
    });

    websocket.current.on("connected", () =>
      setMessages((prev) => [
        ...prev,
        `Websocket connected; watching ${podRoot}`,
      ])
    );

    websocket.current.on("message", (message) =>
      setMessages((prev) => [...prev, formatMessage(message)])
    );

    websocket.current.on("closed", () =>
      setMessages((prev) => [...prev, "Websocket closed"])
    );

    websocket.current.on("error", (error) => {
      /* eslint no-console: 0 */
      console.error(error);
      setMessages((prev) => [
        ...prev,
        "Websocket error (see console for details)",
      ]);
    });

    /* eslint consistent-return: 0 */
    return () => websocket.current.disconnect();
  }, [session.info.isLoggedIn, session.fetch, podRoot]);

  useEffect(() => {
    if (session.info.isLoggedIn) {
      getPodRoot(session.info.webId, session.fetch).then(setPodRoot);
    }
  }, [session.info.isLoggedIn, session.info.webId, session.fetch]);

  useEffect(() => {
    if (session.info.isLoggedIn && podRoot) {
      websocket.current.connect();
    }
  }, [session.info.isLoggedIn, podRoot]);

  return (
    <div>
      <h1>Demo</h1>
      {!session.info.isLoggedIn && <p>Please log in.</p>}

      {session.info.isLoggedIn && <p>Logged in as: {session.info.webId}</p>}

      {session.info.isLoggedIn && <p>Websocket status:</p>}

      {messages.map((m) => (
        <pre>
          <code>{m}</code>
        </pre>
      ))}
    </div>
  );
}
