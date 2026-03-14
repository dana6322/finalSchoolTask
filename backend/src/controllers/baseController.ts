import { Request, Response } from "express";

class BaseController {
  model: any;

  constructor(model: any) {
    this.model = model;
  }

  async getAll(req: Request, res: Response) {
    try {
      if (req.query) {
        const filterData = await this.model.find(req.query);
        return res.json(filterData);
      }
      const data = await this.model.find();
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error retrieving data" });
    }
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const item = await this.model.findById(id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error retrieving item" });
    }
  }

  async create(req: Request, res: Response) {
    const itemData = req.body;
    try {
      const newData = await this.model.create(itemData);
      res.status(201).json(newData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creating item" });
    }
  }

  async del(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const deletedData = await this.model.findByIdAndDelete(id);
      if (!deletedData) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.status(200).json(deletedData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting item" });
    }
  }

  async update(req: Request, res: Response) {
    const id = req.params.id;
    const updateData = req.body;
    try {
      const data = await this.model.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      if (!data) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating item" });
    }
  }
}

export default BaseController;
