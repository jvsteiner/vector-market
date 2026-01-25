### **Product Description: Vector Market**

**Vector Market** is a decentralized peer-to-peer marketplace built for the next generation of the web. It provides a secure and intuitive platform for users to discover, negotiate, and transact directly with one another, eliminating the need for costly intermediaries. By leveraging intelligent vector search and integrating seamlessly with the **Sphere Browser Extension**, Vector Market offers a user experience that is both radically secure and effortlessly simple.

### **The User Experience: Secure by Default, Simple by Design**

Our philosophy is that powerful security should not come at the cost of usability. The entire user journey is designed around the Sphere Browser Extension, which acts as the user's sovereign identity, wallet, and secure messenger.

1.  **Seamless Onboarding (The "No-Login" Login):** New users arriving at the Vector Market web application are greeted with a clean, modern interface. The platform instantly checks for the Sphere extension.
    *   **If Sphere is not installed,** a clear, unobtrusive guide directs the user to the official extension store, explaining the security and privacy benefits.
    *   **If Sphere is installed but not connected,** the primary call-to-action is a single "Connect" button. With one click, the user grants permission through the extension, and the marketplace instantly unlocks. There are no passwords to create, no emails to verify. Your identity is your Sphere ID.

2.  **An Integrated & Fluid Marketplace:** Once connected, the user's Sphere ID is their passport to the marketplace. All interactions feel native to the web application, while the complex cryptographic operations are handled securely in the background by Sphere.
    *   **Intuitive Discovery:** Finding items is powered by a state-of-the-art vector search engine. Users can search by concept and context, not just keywords. A search for "gear for a rainy hike" will find waterproof jackets and boots, even if they don't contain those exact words.
    *   **Direct & Encrypted Communication:** When a user contacts a seller, a chat window opens directly within the Vector Market UI. This is powered by the NOSTR protocol, providing encrypted peer-to-peer messaging with relay-based caching. Sellers can optionally run a local daemon to auto-respond to inquiries when offline.
    *   **Effortless Transactions:** When a deal is reached, a "Pay" button appears in the chat. Clicking this button triggers a confirmation pop-up from the Sphere Browser Extension, detailing the transaction. The user approves the payment with a click, never leaving the application context. The web UI provides real-time feedback, showing "Awaiting Confirmation," "Transaction Sent," and "Success."

### **Technical Architecture: A Hybrid Approach to Decentralization**

Vector Market is architected to maximize decentralization, security, and user control, while utilizing centralized components where they provide a critical performance advantage.

**Frontend Components:**

*   **Web Application (Next.js/React):** A highly responsive single-page application (SPA) that renders the user interface. Its primary responsibilities are managing the UI state and acting as the communication orchestrator between the user, the Sphere extension, and the backend services.
*   **Sphere Browser Extension Integration:** The frontend communicates directly with the Sphere extension via its provided API. It does **not** handle private keys or manage user funds. It requests actions (e.g., "sign this transaction," "send this message") which the user must approve within the extension's secure environment.

**Backend & Decentralized Components:**

1.  **Vector Search Service (Centralized - Qdrant):**
    *   **Function:** To provide the core "intelligent search" functionality. This service is the performance-critical engine of discovery.
    *   **Implementation:** A Qdrant vector database instance with OpenAI embeddings. When sellers create listings, the listing content is embedded via OpenAI and stored directly in Qdrant. The listing record in Qdrant IS the canonical listing data.
    *   **Data Flow:** Listings are public marketplace data. The vector database serves as both the search index and the listing store.

2.  **NOSTR Messaging (Decentralized):**
    *   **Function:** Provides encrypted peer-to-peer messaging between buyers and sellers.
    *   **Implementation:** The Sphere extension manages NOSTR keys and message encryption. The web UI provides the chat interface. NOSTR relays cache messages, allowing asynchronous communication even when parties are offline.
    *   **Optional Seller Daemon:** Sellers who want automatic responses to inquiries can run a lightweight local daemon that monitors their NOSTR inbox and responds based on configured rules. This is optional since relays cache messages for later retrieval.

3.  **Unicity Protocol (Decentralized Payments):**
    *   **Function:** To manage all value-based transactions via token transfers.
    *   **Implementation:** The Sphere wallet uses the Unicity Protocol for token-based payments. When a buyer pays a seller, the Sphere extension constructs and signs the token transfer transaction, submitting it to the Unicity network. The backend never takes custody of assets.
    *   **Token Model:** Unicity uses a token-based (not account-based) model. Tokens carry coin balances and are indivisible units. Partial transfers involve splitting tokens.

### **Roadmap Items**

*   **Escrow:** Multi-signature escrow for high-value transactions, implemented within the Unicity Protocol's token model. Enables trustless transactions with time-locked or condition-based release.
*   **Reputation System:** On-chain reputation tied to Sphere IDs, allowing buyers and sellers to build trust over time.
*   **Image Search:** Vector search for product images in addition to text descriptions.
