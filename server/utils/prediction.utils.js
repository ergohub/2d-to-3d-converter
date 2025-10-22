import {
    DPTForDepthEstimation,
    AutoProcessor,
    RawImage,
    interpolate_4d,
} from "@huggingface/transformers";

let model, processor;

export const loadModel = async () => {
    if (!model || !processor) {
        const model_id = "Xenova/dpt-hybrid-midas";
        model = await DPTForDepthEstimation.from_pretrained(model_id);
        processor = await AutoProcessor.from_pretrained(model_id);
    }
    return { model, processor };
};

export const modelPrediction = async (file) => {
    const { model, processor } = await loadModel(); // reuse instead of reload

    const image = await RawImage.read(file);
    const inputs = await processor(image);

    const { predicted_depth } = await model(inputs);

    const prediction = (
        await interpolate_4d(predicted_depth.unsqueeze(1), {
            size: image.size.reverse(),
            mode: "bilinear",
            device: "cpu",
            dtype: "fp32",
        })
    ).squeeze(1);

    // Visualise the prediction
    const min = prediction.min().item();
    const max = prediction.max().item();
    const formatted = prediction.sub_(min).div_(max - min).mul_(255).to('uint8');
    const depth = RawImage.fromTensor(formatted);
    return depth;
};
