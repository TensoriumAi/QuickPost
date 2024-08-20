class LocalStorageService {
  static getItem(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  static setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  static removeItem(key) {
    localStorage.removeItem(key);
  }

  static clear() {
    localStorage.clear();
  }

  // Helper method for collections
  static getCollection(collectionName) {
    return this.getItem(collectionName) || [];
  }

  static addToCollection(collectionName, item) {
    const collection = this.getCollection(collectionName);
    collection.push(item);
    this.setItem(collectionName, collection);
  }

  static updateInCollection(collectionName, updatedItem, idField = 'id') {
    const collection = this.getCollection(collectionName);
    const index = collection.findIndex(item => item[idField] === updatedItem[idField]);
    if (index !== -1) {
      collection[index] = updatedItem;
      this.setItem(collectionName, collection);
    }
  }

  static removeFromCollection(collectionName, itemId, idField = 'id') {
    const collection = this.getCollection(collectionName);
    const updatedCollection = collection.filter(item => item[idField] !== itemId);
    this.setItem(collectionName, updatedCollection);
  }
}

export default LocalStorageService;