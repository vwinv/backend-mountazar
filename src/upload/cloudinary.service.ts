import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor() {
    // Configuration de Cloudinary depuis les variables d'environnement
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload une image vers Cloudinary
   * @param file - Fichier à uploader (Express.Multer.File)
   * @param folder - Dossier dans Cloudinary (ex: 'products', 'hero', 'gallery', 'promotions')
   * @returns Promise avec l'URL de l'image uploadée
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `mountazar/${folder}`,
          resource_type: 'image',
          transformation: [
            {
              quality: 'auto',
              fetch_format: 'auto',
            },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
            });
          } else {
            reject(new Error('Upload failed: no result returned from Cloudinary'));
          }
        },
      );

      // Convertir le buffer en stream
      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);

      readableStream.pipe(uploadStream);
    });
  }

  /**
   * Upload plusieurs images vers Cloudinary
   * @param files - Tableau de fichiers à uploader
   * @param folder - Dossier dans Cloudinary
   * @returns Promise avec un tableau d'URLs
   */
  async uploadImages(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<{ url: string; public_id: string }[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Supprime une image de Cloudinary
   * @param publicId - ID public de l'image à supprimer
   * @returns Promise avec le résultat de la suppression
   */
  async deleteImage(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }

  /**
   * Supprime plusieurs images de Cloudinary
   * @param publicIds - Tableau d'IDs publics des images à supprimer
   * @returns Promise avec le résultat de la suppression
   */
  async deleteImages(publicIds: string[]): Promise<any> {
    // Supprimer les images une par une (Cloudinary ne supporte pas destroy_resources directement)
    const deletePromises = publicIds.map((publicId) =>
      this.deleteImage(publicId),
    );
    return Promise.all(deletePromises);
  }
}

