package com.example.ptitdelivery.repositories;

import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.provider.MediaStore;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.ptitdelivery.model.Image;
import com.example.ptitdelivery.model.Responses.ApiResponse.ApiResponse;
import com.example.ptitdelivery.network.retrofit.AuthRetrofitFactory;
import com.example.ptitdelivery.network.service.UploadService;
import com.example.ptitdelivery.utils.Resource;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;

public class UploadRepository {
    private final UploadService uploadService;

    public UploadRepository() {
        Retrofit retrofit = AuthRetrofitFactory.getInstance().createClient();
        this.uploadService = retrofit.create(UploadService.class);
    }

    public LiveData<Resource<String>> uploadAvatar(Uri imageUri, Context context) {
        MutableLiveData<Resource<String>> result = new MutableLiveData<>();
        result.setValue(Resource.loading(null));

        File file = new File(getRealPathFromURI(imageUri, context));
        RequestBody requestFile = RequestBody.create(MediaType.parse("image/*"), file);
        MultipartBody.Part body = MultipartBody.Part.createFormData("file", file.getName(), requestFile);

        uploadService.uploadAvatar(body).enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                if (response.isSuccessful()) {
                    result.setValue(Resource.success("Upload thành công!", null));
                } else {
                    result.setValue(Resource.error("Upload thất bại!", null));
                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                result.setValue(Resource.error("Lỗi kết nối: " + t.getMessage(), null));
            }
        });

        return result;
    }

    public LiveData<Resource<List<Image>>> uploadMultipleImages(List<Uri> imageUris, Context context) {
        MutableLiveData<Resource<List<Image>>> result = new MutableLiveData<>();
        result.setValue(Resource.loading(null));

        List<MultipartBody.Part> parts = new ArrayList<>();

        try {
            for (Uri uri : imageUris) {
                byte[] imageBytes = getBytesFromUri(uri, context);

                RequestBody requestFile = RequestBody.create(MediaType.parse("image/*"), imageBytes);
                MultipartBody.Part body = MultipartBody.Part.createFormData("files", "image.jpg", requestFile);
                parts.add(body);
            }
        } catch (Exception e) {
            result.setValue(Resource.error("Lỗi đọc ảnh: " + e.getMessage(), null));
            return result;
        }

        uploadService.uploadImages(parts).enqueue(new Callback<ApiResponse<List<Image>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Image>>> call, Response<ApiResponse<List<Image>>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.setValue(Resource.success("Upload thành công", response.body().getData())); // nếu response.body() chứa data
                } else {
                    result.setValue(Resource.error("Upload thất bại!", null));
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Image>>> call, Throwable t) {
                result.setValue(Resource.error("Lỗi kết nối: " + t.getMessage(), null));
            }
        });

        return result;
    }

    private byte[] getBytesFromUri(Uri uri, Context context) throws Exception {
        try (java.io.InputStream inputStream = context.getContentResolver().openInputStream(uri);
             java.io.ByteArrayOutputStream byteBuffer = new java.io.ByteArrayOutputStream()) {

            int bufferSize = 1024;
            byte[] buffer = new byte[bufferSize];

            int len;
            while ((len = inputStream.read(buffer)) != -1) {
                byteBuffer.write(buffer, 0, len);
            }

            return byteBuffer.toByteArray();
        }
    }

    // Hàm chuyển đổi URI sang đường dẫn thực
    private String getRealPathFromURI(Uri uri, Context context) {
        String result = null;
        Cursor cursor = context.getContentResolver().query(uri, null, null, null, null);
        if (cursor != null) {
            cursor.moveToFirst();
            int idx = cursor.getColumnIndex(MediaStore.Images.ImageColumns.DATA);
            result = cursor.getString(idx);
            cursor.close();
        }
        return result;
    }
}
