require('dotenv').config()

class ChatWoot {
  constructor(_token = "", _api = "", _config = {}) {
    this.token = _token;
    this.api = _api;
    this.config = { accounts: 1, ..._config };
  }

  buildHeader() {
    const header = new Headers();
    header.append("api_access_token", this.token);
    header.append("Content-Type", "application/json");
    return header;
  }

  async getInbox() {
    const requestOptions = {
      method: "GET",
      headers: this.buildHeader(),
    };

    const dataAPI = await fetch(
      `${this.api}/api/v1/accounts/${this.config.accounts}/inboxes`,
      requestOptions
    );
    const data = await dataAPI.json();
    return data.payload;
  }

  async searchByNumber(phone) {
    const requestOptions = {
      method: "GET",
      headers: this.buildHeader(),
    };

    const dataAPI = await fetch(
      `${this.api}/api/v1/accounts/${this.config.accounts}/contacts/search?include_contact_inboxes=false&page=1&sort=-last_activity_at&q=${phone}`,
      requestOptions
    );
    const data = await dataAPI.json();
    return data.payload;
  }

  async createInbox(dataIn) {
    const payload = {
      name: "BOTWS",
      channel: {
        type: "api",
        webhook_url: "",
      },
      ...dataIn,
    };
    const raw = JSON.stringify(payload);

    const requestOptions = {
      method: "POST",
      headers: this.buildHeader(),
      body: raw,
    };

    const dataAPI = await fetch(
      `${this.api}/api/v1/accounts/${this.config.accounts}/inboxes`,
      requestOptions
    );
    const data = await dataAPI.json();
    return data;
  }

  async createContact(dataIn) {
    const payload = {
      phone_number: dataIn.phone_number,
      custom_attributes: { phone_number: dataIn.phone_number },
      ...dataIn,
    };
    const raw = JSON.stringify(payload);

    const requestOptions = {
      method: "POST",
      headers: this.buildHeader(),
      body: raw,
    };

    const dataAPI = await fetch(
      `${this.api}/api/v1/accounts/${this.config.accounts}/contacts`,
      requestOptions
    );
    const data = await dataAPI.json();
    return data;
  }

  async getConversations() {
    const requestOptions = {
      method: "GET",
      headers: this.buildHeader(),
    };

    const dataAPI = await fetch(
      `${this.api}/api/v1/accounts/${this.config.accounts}/inboxes`,
      requestOptions
    );
    const data = await dataAPI.json();
    return data.payload;
  }

  async createConversation(dataIn) {
    const payload = {
      custom_attributes: { phone_number: dataIn.phone_number },
      ...dataIn,
    };
    const raw = JSON.stringify(payload);

    const requestOptions = {
      method: "POST",
      headers: this.buildHeader(),
      body: raw,
    };

    const dataAPI = await fetch(
      `${this.api}/api/v1/accounts/${this.config.accounts}/conversations`,
      requestOptions
    );
    const data = await dataAPI.json();
    return data;
  }

  async filterConversation(dataIn) {
    try {

      const payload = [
        {
          attribute_key: "phone_number",
          filter_operator: "equal_to",
          values: [dataIn.phone_number],
          attribute_model: "standard",
          custom_attribute_type: ""
        },
      ];

      const raw = JSON.stringify({ payload });
  
      console.log('raw filter', raw)
      const requestOptions = {
        method: "POST",
        headers: this.buildHeader(),
        body: raw,
      };

      
      const dataAPI = await fetch(
        `${this.api}/api/v1/accounts/${this.config.accounts}/conversations/filter`,
        requestOptions
      );
      console.log(dataAPI)
      const data = await dataAPI.json();
      return data;
    } catch (error) {
      console.log(error)
    }
  }

  async createMessage(dataIn) {
    const raw = JSON.stringify({
      content: dataIn.msg,
      message_type: dataIn.mode,
      private: true,
    });

    const requestOptions = {
      method: "POST",
      headers: this.buildHeader(),
      body: raw,
    };

    const dataAPI = await fetch(
      `${this.api}/api/v1/accounts/${this.config.accounts}/conversations/${dataIn.conversationId}/messages`,
      requestOptions
    );
    const data = await dataAPI.json();
    return data;
  }
}

module.exports = ChatWoot