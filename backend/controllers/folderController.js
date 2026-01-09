import Folder from '../models/Folder.js';

export const createFolder = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Folder name required' });
    }

    const folder = new Folder({
      name,
      description,
      userId: req.userId
    });

    await folder.save();
    res.status(201).json({ message: 'Folder created', folder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ userId: req.userId })
      .populate('sharedWith', 'username email')
      .sort({ createdAt: -1 });
    res.json(folders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id)
      .populate('sharedWith', 'username email');
    
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    res.json(folder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateFolder = async (req, res) => {
  try {
    const { name, description } = req.body;

    const folder = await Folder.findByIdAndUpdate(
      req.params.id,
      { name, description, updatedAt: Date.now() },
      { new: true }
    );

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    res.json({ message: 'Folder updated', folder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findByIdAndDelete(req.params.id);
    
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    res.json({ message: 'Folder deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const shareFolder = async (req, res) => {
  try {
    const { userId } = req.body;
    const folder = await Folder.findByIdAndUpdate(
      req.params.id,
      { 
        $addToSet: { sharedWith: userId },
        isShared: true,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('sharedWith', 'username email');

    res.json({ message: 'Folder shared', folder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
